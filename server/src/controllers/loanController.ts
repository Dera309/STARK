import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Loan } from '../models/Loan';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { UnprocessableEntity, NotFound, Forbidden, Conflict } from '../middleware/errorHandler';
import { io } from '../socket';
import { LoanProduct } from '@shared/index';

const LOAN_PRODUCTS: LoanProduct[] = [
  {
    productType: 'QUICK_LOAN',
    name: 'Quick Nano Loan',
    interestRate: 15, // 15% total interest
    maxAmount: 5000000, // 50,000.00
    tenureMonths: 3,
    description: 'Instant cash for small emergencies. No paperwork required.',
  },
  {
    productType: 'SALARY_ADVANCE',
    name: 'Salary Advance',
    interestRate: 10,
    maxAmount: 20000000, // 200,000.00
    tenureMonths: 1,
    description: 'Get up to 50% of your salary before payday.',
  },
  {
    productType: 'DEVICE_FINANCING',
    name: 'Smartphone Finance',
    interestRate: 20,
    maxAmount: 50000000, // 500,000.00
    tenureMonths: 12,
    description: 'Upgrade your tech today. Pay small-small.',
  },
];

/**
 * Get available loan products
 */
export const getProducts = async (req: AuthRequest, res: Response) => {
  res.status(200).json(LOAN_PRODUCTS);
};

/**
 * Apply for a loan
 */
export const applyForLoan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productType, amount, disbursementAccountId } = req.body;

    // 1. Validation
    const product = LOAN_PRODUCTS.find(p => p.productType === productType);
    if (!product) throw UnprocessableEntity('Invalid loan product');

    if (amount <= 0 || amount > product.maxAmount) {
      throw UnprocessableEntity(`Amount must be between 1 and ${product.maxAmount / 100}`);
    }

    // Check for existing active loan of same type
    const existingLoan = await Loan.findOne({ 
      userId: req.user._id, 
      productType, 
      status: { $in: ['PENDING', 'APPROVED', 'ACTIVE'] } 
    }).session(session);
    
    if (existingLoan) {
      throw Conflict('You already have an active loan or pending application for this product');
    }

    const account = await Account.findOne({ _id: disbursementAccountId, userId: req.user._id }).session(session);
    if (!account) throw NotFound('Disbursement account not found');

    if (account.status !== 'ACTIVE') {
      throw Forbidden('Cannot disburse loan to a frozen or closed account');
    }

    // 2. Calculation
    const interest = Math.round(amount * (product.interestRate / 100));
    const totalRepayable = amount + interest;
    const monthlyPayment = Math.round(totalRepayable / product.tenureMonths);

    // 3. Create Loan Record
    const loan = new Loan({
      userId: req.user._id,
      productType,
      principalAmount: amount,
      interestRate: product.interestRate,
      tenureMonths: product.tenureMonths,
      monthlyPayment,
      outstandingBalance: totalRepayable,
      status: 'PENDING',
      disbursedToAccountId: account._id,
      nextRepaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    // 4. Auto-Approval & Disbursement Logic (For Test/Demo)
    const user = await User.findById(req.user._id).session(session);
    if (user?.kycStatus === 'VERIFIED') {
      loan.status = 'ACTIVE';
      loan.approvedByAdminId = user._id as any; // System-approved

      // Credit the account
      account.balance += amount;
      await account.save({ session });

      // Create Transaction Record
      const tx = new Transaction({
        transactionId: uuidv4(),
        accountId: account._id,
        userId: user._id,
        type: 'CREDIT',
        amount,
        currency: account.currency,
        status: 'SUCCESS',
        category: 'LOAN',
        merchantName: `STARK LOAN: ${product.name}`,
        initiatedBy: 'SYSTEM',
      });
      await tx.save({ session });
    }

    await loan.save({ session });
    await session.commitTransaction();

    if (loan.status === 'ACTIVE') {
      io.to(`user:${user!._id.toString()}`).emit('balance:updated', { 
        accountId: account._id, 
        newBalance: account.balance 
      });

      if (notificationService) {
        await notificationService.notifyLoanDisbursed(user!._id.toString(), amount, account.currency, product.name);
      }
    }

    res.status(201).json({
      message: loan.status === 'ACTIVE' ? 'Loan approved and disbursed' : 'Application submitted',
      loan,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * Get user loans
 */
export const listMyLoans = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(loans);
  } catch (error) {
    next(error);
  }
};

/**
 * Repay a loan
 */
export const repayLoan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { loanId, accountId, amount } = req.body;

    const loan = await Loan.findOne({ _id: loanId, userId: req.user._id }).session(session);
    if (!loan) throw NotFound('Loan not found');
    if (loan.status !== 'ACTIVE') throw Forbidden('Loan is not active');

    // Auto-select primary account if none provided
    let paymentAccount = null;
    if (accountId) {
      paymentAccount = await Account.findOne({ _id: accountId, userId: req.user._id }).session(session);
    } else {
      // Get user's first account (primary account)
      paymentAccount = await Account.findOne({ userId: req.user._id }).session(session);
    }
    
    if (!paymentAccount) throw NotFound('Payment account not found');
    if (paymentAccount.balance < amount) throw UnprocessableEntity('Insufficient funds in account');

    const roundedAmount = Math.min(amount, loan.outstandingBalance);

    // 1. Update balances
    paymentAccount.balance -= roundedAmount;
    loan.outstandingBalance -= roundedAmount;

    if (loan.outstandingBalance <= 0) {
      loan.status = 'REPAID';
      loan.outstandingBalance = 0;
    }

    await paymentAccount.save({ session });
    await loan.save({ session });

    // 2. Create Transaction Record
    const tx = new Transaction({
      transactionId: uuidv4(),
      accountId: paymentAccount._id,
      userId: req.user._id,
      type: 'DEBIT',
      amount: roundedAmount,
      currency: paymentAccount.currency,
      status: 'SUCCESS',
      category: 'LOAN',
      merchantName: `LOAN REPAYMENT: ${loan.productType}`,
      counterpartyAccountId: null,
    });
    await tx.save({ session });

    await session.commitTransaction();

    if (io) {
      io.to(`user:${req.user._id}`).emit('balance:updated', {
        accountId: paymentAccount._id,
        newBalance: paymentAccount.balance
      });
    }

    if (notificationService) {
      await notificationService.notifyLoanRepayment(req.user._id, roundedAmount, paymentAccount.currency, loan.outstandingBalance);
    }

    res.status(200).json({
      message: loan.status === 'REPAID' ? 'Loan fully repaid!' : 'Repayment successful',
      loan,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
