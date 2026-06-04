import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { UnprocessableEntity, NotFound, Forbidden } from '../middleware/errorHandler';
import { io } from '../socket';
import PDFDocument from 'pdfkit';

/**
 * Helper function to get transaction description
 */
const getTransactionDescription = (tx: any): string => {
  if (tx.status === 'FAILED' || tx.status === 'VOIDED') {
    return tx.failureReason || `${tx.status} Transaction`;
  }
  
  if (tx.type === 'LOAN_DISBURSEMENT') {
    return 'Loan Disbursement';
  }
  
  if (tx.type === 'LOAN_REPAYMENT') {
    return 'Loan Repayment';
  }
  
  if (tx.type === 'FD_DEBIT') {
    return 'Fixed Deposit Withdrawal';
  }
  
  if (tx.type === 'FD_CREDIT') {
    return 'Fixed Deposit Interest';
  }
  
  if (tx.type === 'ADMIN_CREDIT') {
    return 'Admin Credit';
  }
  
  if (tx.category === 'TRANSFER') {
    return tx.type === 'DEBIT' ? 'Internal Transfer Out' : 'Internal Transfer In';
  }
  
  return tx.merchantName || tx.category || 'Transaction';
};

/**
 * Generate and download a PDF transaction statement
 */
/**
 * Helper to draw PDF page footer
 */
const drawFooter = (doc: any, pageNum: number) => {
  doc.save();
  // Thin gold rule at the bottom
  doc.strokeColor('#d4af37').lineWidth(1).moveTo(50, 735).lineTo(562, 735).stroke();
  
  // Footer text
  doc.fillColor('#64748b').fontSize(7).font('Helvetica');
  doc.text(
    'STARK Premium Banking App • Member FDIC • CFPB • FinCEN • FINRA/SIPC • NYDFS • NMLS • SWIFT • FHLB',
    50,
    745,
    { align: 'center', width: 512 }
  );
  doc.text(
    `Page ${pageNum}`,
    50,
    760,
    { align: 'right', width: 512 }
  );
  doc.restore();
};

/**
 * Helper to draw PDF page header & return starting y coordinate for content
 */
const drawHeader = (doc: any, pageNum: number, start: Date, end: Date, account: any, req: any, openingBalance: number, closingBalance: number) => {
  doc.save();
  if (pageNum === 1) {
    // 1. Dark Navy top banner: y = 0 to 100
    doc.rect(0, 0, 612, 100).fill('#0a1628');
    
    // Logo "STARK" in gold, "ELITE ACCESS" in white
    doc.fillColor('#d4af37').fontSize(26).font('Helvetica-Bold').text('STARK', 50, 30);
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('E L I T E   A C C E S S', 50, 60);
    
    // Banner Right Side: "ACCOUNT STATEMENT" and Period
    doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('ACCOUNT STATEMENT', 300, 30, { align: 'right', width: 262 });
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(
      `Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      300,
      55,
      { align: 'right', width: 262 }
    );
    
    // Gold Accent bar at the bottom of header: y = 97 to 100
    doc.rect(0, 97, 612, 3).fill('#d4af37');

    // 2. Account Details Card: y = 120 to 200
    // Fill background with extremely light warm cream/gold wash
    doc.rect(50, 120, 512, 80).fill('#fdfbf7');
    // Draw gold border
    doc.strokeColor('#d4af37').lineWidth(1).rect(50, 120, 512, 80).stroke();
    
    // Account details text in dark navy `#0a1628`
    doc.fillColor('#0a1628');
    doc.fontSize(11).font('Helvetica-Bold').text('Account Details', 70, 135);
    doc.fontSize(9).font('Helvetica').text(`Holder: ${req.user.firstName} ${req.user.lastName}`, 70, 155);
    doc.text(`Account Number: •••• •••• ${account.accountNumber.slice(-4)}`, 70, 172);
    
    doc.fontSize(11).font('Helvetica-Bold').text('Statement Summary', 320, 135);
    doc.fontSize(9).font('Helvetica').text(`Opening Balance: ${(openingBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${account.currency}`, 320, 155);
    doc.fontSize(9).font('Helvetica-Bold').text(`Closing Balance: ${(closingBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${account.currency}`, 320, 172);

    // 3. Table Header: y = 220
    doc.rect(50, 220, 512, 22).fill('#0a1628');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('Date', 60, 226);
    doc.text('Description', 140, 226);
    doc.text('Type', 360, 226);
    doc.text('Amount', 450, 226, { align: 'right', width: 102 });

    doc.restore();
    return 248; // Starting y for rows on page 1
  } else {
    // Page 2+ mini header
    doc.fillColor('#0a1628').fontSize(16).font('Helvetica-Bold').text('STARK', 50, 35);
    doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold').text('ACCOUNT STATEMENT', 150, 42);
    
    // Thin gold line
    doc.strokeColor('#d4af37').lineWidth(1).moveTo(50, 58).lineTo(562, 58).stroke();

    // Table Header: y = 68
    doc.rect(50, 68, 512, 22).fill('#0a1628');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('Date', 60, 74);
    doc.text('Description', 140, 74);
    doc.text('Type', 360, 74);
    doc.text('Amount', 450, 74, { align: 'right', width: 102 });

    doc.restore();
    return 96; // Starting y for rows on page 2+
  }
};

/**
 * Generate and download a PDF transaction statement
 */
export const downloadStatement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId, startDate, endDate, period } = req.query;
    const userId = req.user._id;

    if (!accountId) throw UnprocessableEntity('Account ID is required');

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) throw NotFound('Account not found');

    let start: Date;
    if (startDate) {
      start = new Date(startDate as string);
    } else if (period === '3m') {
      start = new Date();
      start.setMonth(start.getMonth() - 3);
    } else if (period === '6m') {
      start = new Date();
      start.setMonth(start.getMonth() - 6);
    } else if (period === '1y') {
      start = new Date();
      start.setFullYear(start.getFullYear() - 1);
    } else {
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    const end = endDate ? new Date(endDate as string) : new Date();

    // Fetch all successful transactions since start date to calculate correct historical opening/closing balance
    const allTransactions = await Transaction.find({
      accountId,
      userId,
      status: 'SUCCESS',
      createdAt: { $gte: start },
    }).sort({ createdAt: -1 });

    // Filter down to the specific statement period
    const transactions = allTransactions.filter(tx => tx.createdAt <= end);

    // Calculate historical balances
    let closingBalance = account.balance;
    allTransactions.forEach((tx) => {
      if (tx.createdAt > end) {
        if (tx.type === 'DEBIT') {
          closingBalance += tx.amount;
        } else {
          closingBalance -= tx.amount;
        }
      }
    });

    let openingBalance = closingBalance;
    transactions.forEach((tx) => {
      if (tx.type === 'DEBIT') {
        openingBalance += tx.amount;
      } else {
        openingBalance -= tx.amount;
      }
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=STARK_Statement_${account.accountNumber}.pdf`);

    doc.pipe(res);

    let pageNum = 1;
    let y = drawHeader(doc, pageNum, start, end, account, req, openingBalance, closingBalance);
    drawFooter(doc, pageNum);

    doc.font('Helvetica').fontSize(9);

    if (transactions.length === 0) {
      doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(10);
      doc.text('No transactions recorded during this period.', 50, y + 30, { align: 'center', width: 512 });
    } else {
      transactions.forEach((tx, idx) => {
        if (y > 700) {
          doc.addPage();
          pageNum++;
          y = drawHeader(doc, pageNum, start, end, account, req, openingBalance, closingBalance);
          drawFooter(doc, pageNum);
          doc.font('Helvetica').fontSize(9);
        }

        // Alternating row background shading
        if (idx % 2 === 1) {
          doc.save();
          doc.rect(50, y - 2, 512, 20).fill('#f8fafc');
          doc.restore();
        }

        // Draw horizontal row separator
        doc.save();
        doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, y + 18).lineTo(562, y + 18).stroke();
        doc.restore();

        doc.fillColor('#0f172a');
        doc.text(tx.createdAt.toLocaleDateString(), 60, y + 4);
        
        const desc = getTransactionDescription(tx);
        doc.text(desc.slice(0, 42), 140, y + 4);
        
        doc.text(tx.type, 360, y + 4);

        // Format amount: debit prefix "-" or credit prefix "+"
        const prefix = tx.type === 'DEBIT' ? '-' : '+';
        const formattedAmount = `${prefix}${(tx.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${tx.currency}`;
        
        if (tx.type === 'DEBIT') {
          doc.fillColor('#b91c1c').font('Helvetica-Bold'); // Stark elegant red
        } else {
          doc.fillColor('#15803d').font('Helvetica-Bold'); // Stark elegant green
        }
        
        doc.text(formattedAmount, 450, y + 4, { align: 'right', width: 102 });
        doc.font('Helvetica'); // Reset font style

        y += 20;
      });
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

/**
 * List all transactions for the authenticated user
 */
export const listTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, accountId } = req.query;

    const filter: any = { userId };
    if (accountId) filter.accountId = accountId;

    const transactions = await Transaction.find(filter)
      .populate('counterpartyAccountId', 'userId accountNumber')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Fetch counterparty user details for transfers and enhance transaction data
    const transactionsWithNames = await Promise.all(
      transactions.map(async (tx) => {
        const txObj = tx.toObject();
        
        // Ensure proper transaction status handling
        if (!txObj.status) {
          txObj.status = 'SUCCESS';
        }
        
        // If this is a transfer with counterparty, fetch their name
        if (tx.counterpartyAccountId && (tx.category === 'TRANSFER' || tx.merchantName.includes('TRANSFER'))) {
          try {
            const counterpartyAccount = await Account.findById(tx.counterpartyAccountId).populate('userId', 'firstName lastName');
            if (counterpartyAccount && counterpartyAccount.userId) {
              const counterpartyUser = counterpartyAccount.userId as any;
              txObj.counterpartyName = `${counterpartyUser.firstName} ${counterpartyUser.lastName}`;
              txObj.counterpartyAccountNumber = counterpartyAccount.accountNumber;
            }
          } catch (error) {
            console.error('Error fetching counterparty details:', error);
            // Set default values if counterparty fetch fails
            txObj.counterpartyName = 'Unknown User';
            txObj.counterpartyAccountNumber = txObj.counterpartyAccountNumber || 'Unknown Account';
          }
        }
        
        // Ensure merchant name is properly set
        if (!txObj.merchantName || txObj.merchantName === 'STARK INTERNAL') {
          txObj.merchantName = getTransactionDescription(txObj);
        }
        
        return txObj;
      })
    );

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      transactions: transactionsWithNames,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Perform an internal transfer between STARK accounts
 */
export const internalTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sourceAccountId, targetAccountNumber, amount, category = 'TRANSFER' } = req.body;

    if (!sourceAccountId || !targetAccountNumber || !amount) {
      throw UnprocessableEntity('Source account, target account number, and amount are required');
    }

    if (amount <= 0) {
      throw UnprocessableEntity('Amount must be greater than zero');
    }

    // 1. Fetch and validate source account
    const sourceAccount = await Account.findOne({ _id: sourceAccountId, userId: req.user._id }).session(session);
    if (!sourceAccount) {
      throw NotFound('Source account not found or does not belong to user');
    }

    if (sourceAccount.status !== 'ACTIVE') {
      throw Forbidden('Source account is not active');
    }

    if (sourceAccount.balance < amount) {
      throw UnprocessableEntity('Insufficient funds');
    }

    // 2. Fetch and validate target account
    const targetAccount = await Account.findOne({ accountNumber: targetAccountNumber }).session(session);
    if (!targetAccount) {
      throw NotFound('Target account not found');
    }

    if (targetAccount.status !== 'ACTIVE') {
      throw Forbidden('Target account is not active');
    }
    
    if (sourceAccount._id.toString() === targetAccount._id.toString()) {
      throw UnprocessableEntity('Cannot transfer to the same account');
    }

    // 3. Perform balance updates
    sourceAccount.balance -= amount;
    targetAccount.balance += amount;

    await sourceAccount.save({ session });
    await targetAccount.save({ session });

    // 4. Create Transaction records (Audit Trail)
    const transactionGroupId = uuidv4();
    const isHighValue = amount >= 500000; // Flag if >= 5,000.00 (minor units)

    const debitTransaction = new Transaction({
      transactionId: uuidv4(),
      accountId: sourceAccount._id,
      userId: sourceAccount.userId,
      type: 'DEBIT',
      amount,
      currency: sourceAccount.currency,
      status: 'SUCCESS',
      category,
      merchantName: 'INTERNAL TRANSFER OUT',
      counterpartyAccountId: targetAccount._id,
      counterpartyAccountNumber: targetAccount.accountNumber,
      isHighValue,
    });

    const creditTransaction = new Transaction({
      transactionId: uuidv4(),
      accountId: targetAccount._id,
      userId: targetAccount.userId,
      type: 'CREDIT',
      amount,
      currency: targetAccount.currency,
      status: 'SUCCESS',
      category,
      merchantName: 'INTERNAL TRANSFER IN',
      counterpartyAccountId: sourceAccount._id,
      counterpartyAccountNumber: sourceAccount.accountNumber,
      isHighValue,
    });

    await debitTransaction.save({ session });
    await creditTransaction.save({ session });

    // 5. Commit Transaction
    await session.commitTransaction();

    // 6. Real-time updates via Socket.io
    if (io) {
      // Balance updates
      io.to(`user:${sourceAccount.userId}`).emit('balance:updated', {
        accountId: sourceAccount._id,
        newBalance: sourceAccount.balance,
        transactionId: debitTransaction.transactionId
      });

      io.to(`user:${targetAccount.userId}`).emit('balance:updated', {
        accountId: targetAccount._id,
        newBalance: targetAccount.balance,
        transactionId: creditTransaction.transactionId
      });

      // Transaction completion notifications
      io.to(`user:${sourceAccount.userId}`).emit('transaction:completed', debitTransaction.toObject());
      io.to(`user:${targetAccount.userId}`).emit('transaction:completed', creditTransaction.toObject());
    }

    // 7. Fetch user details for notifications
    const [sourceUser, targetUser] = await Promise.all([
      User.findById(sourceAccount.userId),
      User.findById(targetAccount.userId)
    ]);

    // 8. Notifications with sender/receiver details
    try {
      if (notificationService) {
        await Promise.all([
          notificationService.notifyTransaction(
            sourceAccount.userId.toString(), 
            amount, 
            sourceAccount.currency, 
            'DEBIT',
            {
              name: `${targetUser?.firstName || 'Unknown'} ${targetUser?.lastName || 'User'}`,
              accountNumber: targetAccount.accountNumber
            }
          ),
          notificationService.notifyTransaction(
            targetAccount.userId.toString(), 
            amount, 
            targetAccount.currency, 
            'CREDIT',
            {
              name: `${sourceUser?.firstName || 'Unknown'} ${sourceUser?.lastName || 'User'}`,
              accountNumber: sourceAccount.accountNumber
            }
          )
        ]);
        console.log('Transaction notifications sent successfully');
      } else {
        console.warn('Notification service not available');
      }
    } catch (notificationError) {
      console.error('Failed to send transaction notifications:', notificationError);
      // Don't fail the transaction if notifications fail
    }

    res.status(200).json({
      message: 'Transfer successful',
      transactionId: debitTransaction.transactionId,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
