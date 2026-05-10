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
export const downloadStatement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId, startDate, endDate } = req.query;
    const userId = req.user._id;

    if (!accountId) throw UnprocessableEntity('Account ID is required');

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) throw NotFound('Account not found');

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const transactions = await Transaction.find({
      accountId,
      userId,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 50 });

    // Header
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=STARK_Statement_${account.accountNumber}.pdf`);

    doc.pipe(res);

    // STARK Logo (Simulated)
    doc.fillColor('#6200EE').fontSize(24).font('Helvetica-Bold').text('STARK', 50, 50);
    doc.fontSize(10).fillColor('#444').text('DIGITAL BANKING PLATFORM', 50, 75);

    // Document Title
    doc.fillColor('#000').fontSize(16).text('Account Statement', 0, 100, { align: 'center' });
    doc.fontSize(10).text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, 0, 120, { align: 'center' });

    // Account Summary
    doc.rect(50, 150, 500, 80).fill('#F5F5F5').stroke();
    doc.fillColor('#000').fontSize(12).font('Helvetica-Bold').text('Account Details', 70, 165);
    doc.font('Helvetica').fontSize(10).text(`Holder: ${req.user.firstName} ${req.user.lastName}`, 70, 185);
    doc.text(`Account Number: ${account.accountNumber}`, 70, 200);
    doc.text(`Currency: ${account.currency}`, 350, 185);
    doc.font('Helvetica-Bold').text(`Balance: ${(account.balance / 100).toLocaleString()} ${account.currency}`, 350, 200);

    // Table Header
    const tableTop = 260;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Date', 50, tableTop);
    doc.text('Description', 150, tableTop);
    doc.text('Type', 350, tableTop);
    doc.text('Amount', 450, tableTop, { align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Content
    let y = tableTop + 30;
    doc.font('Helvetica').fontSize(9);

    transactions.forEach((tx) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      doc.text(tx.createdAt.toLocaleDateString(), 50, y);
      doc.text(tx.merchantName.slice(0, 30), 150, y);
      doc.text(tx.type, 350, y);
      doc.font('Helvetica-Bold').text(`${(tx.amount / 100).toLocaleString()} ${tx.currency}`, 450, y, { align: 'right' }).font('Helvetica');
      y += 20;
    });

    // Footer
    doc.fontSize(8).fillColor('#999').text('This is a computer-generated statement and does not require a signature.', 0, 750, { align: 'center' });

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
