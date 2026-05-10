import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { FixedDeposit } from '../models/FixedDeposit';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { UnprocessableEntity, NotFound, Forbidden } from '../middleware/errorHandler';
import { io } from '../socket';

/**
 * Helper to calculate projected maturity amount
 */
const calculateMaturity = (principal: number, rate: number, tenureMonths: number) => {
  const interest = Math.round(principal * (rate / 100) * (tenureMonths / 12));
  return principal + interest;
};

/**
 * Create a Fixed Deposit
 */
export const createFixedDeposit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { principalAmount, interestRate, tenureMonths, sourceAccountId, destinationAccountId } = req.body;

    // 1. Validation
    if (principalAmount < 100000) throw UnprocessableEntity('Minimum deposit is 1,000.00');
    
    const sourceAccount = await Account.findOne({ _id: sourceAccountId, userId: req.user._id }).session(session);
    if (!sourceAccount) throw NotFound('Source account not found');
    if (sourceAccount.balance < principalAmount) throw UnprocessableEntity('Insufficient funds');

    const destAccount = await Account.findOne({ _id: destinationAccountId, userId: req.user._id }).session(session);
    if (!destAccount) throw NotFound('Destination account not found');
    
    // Additional validation
    if (sourceAccountId === destinationAccountId) {
      // This is allowed - funds return to same account on maturity
      console.log(`Fixed deposit creation: Source and destination accounts are the same`);
    }

    // 2. Calculations
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);
    const projectedMaturityAmount = calculateMaturity(principalAmount, interestRate, tenureMonths);

    // 3. Create Record
    const fd = new FixedDeposit({
      userId: req.user._id,
      depositRef: `FD-${uuidv4().split('-')[0].toUpperCase()}`,
      principalAmount,
      interestRate,
      tenureMonths,
      maturityDate,
      projectedMaturityAmount,
      currentValue: principalAmount,
      sourceAccountId,
      destinationAccountId,
      status: 'ACTIVE',
    });

    // 4. Fund Movement
    sourceAccount.balance -= principalAmount;
    await sourceAccount.save({ session });

    const tx = new Transaction({
      transactionId: uuidv4(),
      accountId: sourceAccountId,
      userId: req.user._id,
      type: 'FD_DEBIT',
      amount: principalAmount,
      currency: sourceAccount.currency,
      status: 'SUCCESS',
      category: 'INVESTMENT',
      merchantName: `FD CREATION: ${fd.depositRef}`,
    });
    await tx.save({ session });

    await fd.save({ session });
    await session.commitTransaction();

    io.to(`user:${req.user._id}`).emit('balance:updated', { 
      accountId: sourceAccountId, 
      newBalance: sourceAccount.balance 
    });

    res.status(201).json(fd);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * List Investments
 */
export const listFixedDeposits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deposits = await FixedDeposit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(deposits);
  } catch (error) {
    next(error);
  }
};

/**
 * Liquidate Fixed Deposit
 */
export const liquidateFixedDeposit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fdId } = req.body;
    const fd = await FixedDeposit.findOne({ _id: fdId, userId: req.user._id }).session(session);
    if (!fd) throw NotFound('Investment not found');
    if (fd.status !== 'ACTIVE') throw Forbidden('Investment is not active');

    const now = new Date();
    const isMatured = now >= fd.maturityDate;
    let payoutAmount = fd.principalAmount;

    if (isMatured) {
      payoutAmount = fd.projectedMaturityAmount;
      fd.status = 'MATURED';
    } else {
      // Early Withdrawal Penalty
      const totalPlannedInterest = fd.projectedMaturityAmount - fd.principalAmount;
      const timePassedRatio = Math.min(1, (now.getTime() - (fd as any).createdAt.getTime()) / (fd.maturityDate.getTime() - (fd as any).createdAt.getTime()));
      const earnedInterest = Math.round(totalPlannedInterest * timePassedRatio);
      const penalty = Math.round(earnedInterest * fd.earlyWithdrawalPenaltyRate);
      payoutAmount = fd.principalAmount + (earnedInterest - penalty);
      fd.status = 'LIQUIDATED';
    }

    const destAccount = await Account.findOne({ _id: fd.destinationAccountId, userId: req.user._id }).session(session);
    if (!destAccount) throw NotFound('Destination account not found');

    destAccount.balance += payoutAmount;
    await destAccount.save({ session });

    const tx = new Transaction({
      transactionId: uuidv4(),
      accountId: destAccount._id,
      userId: req.user._id,
      type: 'FD_CREDIT',
      amount: payoutAmount,
      currency: destAccount.currency,
      status: 'SUCCESS',
      category: 'INVESTMENT',
      merchantName: `FD LIQUIDATION: ${fd.depositRef} ${isMatured ? '(MATURED)' : '(EARLY)'}`,
    });
    await tx.save({ session });

    await fd.save({ session });
    await session.commitTransaction();

    io.to(`user:${req.user._id}`).emit('balance:updated', { 
      accountId: destAccount._id, 
      newBalance: destAccount.balance 
    });

    res.status(200).json({ message: 'Liquidation successful', payoutAmount, status: fd.status });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
