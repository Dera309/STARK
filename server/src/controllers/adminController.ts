import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { Loan } from '../models/Loan';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { NotFound, UnprocessableEntity } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../socket';

/**
 * Admin credit account - for testing and admin operations
 */
export const creditAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId, amount, reason = 'Admin Credit' } = req.body;

    if (!accountId || !amount) {
      throw UnprocessableEntity('Account ID and amount are required');
    }

    if (amount <= 0) {
      throw UnprocessableEntity('Amount must be greater than zero');
    }

    const account = await Account.findById(accountId);
    if (!account) {
      throw NotFound('Account not found');
    }

    if (account.status === 'FROZEN' || account.status === 'CLOSED') {
      throw UnprocessableEntity('Cannot credit a frozen or closed account');
    }

    // Update account balance
    account.balance += amount;
    await account.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: uuidv4(),
      accountId: account._id,
      userId: account.userId,
      type: 'ADMIN_CREDIT',
      amount,
      currency: account.currency,
      status: 'SUCCESS',
      category: 'ADMIN_OPERATION',
      merchantName: reason,
      initiatedBy: 'ADMIN',
      adminId: req.user._id,
      adminReason: reason,
    });

    await transaction.save();

    // Emit socket event
    io.to(`user:${account.userId}`).emit('balance:updated', {
      accountId: account._id,
      newBalance: account.balance,
      transactionId: transaction.transactionId
    });

    // Send notification with admin details
    if (notificationService) {
      const adminUser = await User.findById(req.user._id);
      const amountStr = (amount / 100).toLocaleString();
      const title = 'Account Credited';
      const body = `Your account was credited with ${amountStr} ${account.currency} by ${adminUser?.firstName || 'Admin'} ${adminUser?.lastName || ''}. Reason: ${reason}`;
      
      await notificationService.notifyUser(account.userId.toString(), 'TRANSACTION', title, body, 'BOTH');
    }

    res.status(200).json({
      message: 'Account credited successfully',
      account,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin debit account - remove funds from user account
 */
export const debitAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId, amount, reason = 'Admin Debit' } = req.body;

    if (!accountId || !amount) {
      throw UnprocessableEntity('Account ID and amount are required');
    }

    if (amount <= 0) {
      throw UnprocessableEntity('Amount must be greater than zero');
    }

    const account = await Account.findById(accountId);
    if (!account) {
      throw NotFound('Account not found');
    }

    if (account.status === 'FROZEN' || account.status === 'CLOSED') {
      throw UnprocessableEntity('Cannot debit a frozen or closed account');
    }

    if (account.balance < amount) {
      throw UnprocessableEntity('Insufficient funds in account');
    }

    // Update account balance
    account.balance -= amount;
    await account.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: uuidv4(),
      accountId: account._id,
      userId: account.userId,
      type: 'ADMIN_CREDIT', // Negative amount represents debit
      amount: -amount,
      currency: account.currency,
      status: 'SUCCESS',
      category: 'ADMIN_OPERATION',
      merchantName: reason,
      initiatedBy: 'ADMIN',
      adminId: req.user._id,
      adminReason: reason,
    });

    await transaction.save();

    // Emit socket event
    io.to(`user:${account.userId}`).emit('balance:updated', {
      accountId: account._id,
      newBalance: account.balance,
      transactionId: transaction.transactionId
    });

    // Send notification with admin details
    if (notificationService) {
      const adminUser = await User.findById(req.user._id);
      const amountStr = (amount / 100).toLocaleString();
      const title = 'Account Debited';
      const body = `${amountStr} ${account.currency} was debited from your account by ${adminUser?.firstName || 'Admin'} ${adminUser?.lastName || ''}. Reason: ${reason}`;
      
      await notificationService.notifyUser(account.userId.toString(), 'TRANSACTION', title, body, 'BOTH');
    }

    res.status(200).json({
      message: 'Account debited successfully',
      account,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Close/Block a user account
 */
export const closeAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const account = await Account.findById(id);
    if (!account) {
      throw NotFound('Account not found');
    }

    if (account.status === 'CLOSED') {
      throw UnprocessableEntity('Account is already closed');
    }

    // Check if account has remaining balance
    if (account.balance > 0) {
      throw UnprocessableEntity('Cannot close account with remaining balance. Please transfer funds first.');
    }

    account.status = 'CLOSED';
    await account.save();

    res.status(200).json({
      message: 'Account closed successfully',
      account
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend or reactivate a user
 */
export const manageUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, failedLoginAttempts, lockedUntil } = req.body;

    console.log('Managing user status:', { id, status, failedLoginAttempts, lockedUntil });

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      console.log('Invalid status provided:', status);
      throw UnprocessableEntity('Invalid user status. Must be ACTIVE or SUSPENDED.');
    }

    const user = await User.findById(id);
    if (!user) {
      console.log('User not found with ID:', id);
      throw NotFound('User not found');
    }

    console.log('Current user status:', user.status);
    console.log('Updating user status to:', status);

    user.status = status;
    
    // Reset login attempts and lock if provided
    if (failedLoginAttempts !== undefined) {
      user.failedLoginAttempts = failedLoginAttempts;
    }
    if (lockedUntil !== undefined) {
      user.lockedUntil = lockedUntil;
    }
    
    await user.save();

    console.log('User status updated successfully');

    // Emit socket event to notify user
    if (io) {
      io.to(`user:${id}`).emit('account:suspended', {
        status,
        message: status === 'SUSPENDED' 
          ? 'Your account has been suspended by an administrator.' 
          : 'Your account has been reactivated.'
      });
    }

    res.status(200).json({
      message: `User ${status === 'SUSPENDED' ? 'suspended' : 'reactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Error in manageUserStatus:', error);
    next(error);
  }
};

/**
 * Get aggregated bank health statistics
 */
export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      pendingKycUsers,
      accounts,
      loans,
      recentTransCount
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ kycStatus: 'PENDING' }),
      Account.find({}),
      Loan.find({ status: 'ACTIVE' }),
      Transaction.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);

    const totalAssetsValue = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    const totalLoanValue = loans.reduce((acc, curr) => acc + curr.outstandingBalance, 0);

    res.status(200).json({
      totalUsers,
      pendingKycUsers,
      totalAssetsValue,
      totalLoanValue,
      recentTransCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all users with basic filtering
 */
export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, kycStatus, status } = req.query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (kycStatus) filter.kycStatus = kycStatus;
    if (status) filter.status = status;

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(100);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed user info including accounts and loans
 */
export const getUserDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw NotFound('User not found');

    const [accounts, loans, transactions] = await Promise.all([
      Account.find({ userId: id }),
      Loan.find({ userId: id }),
      Transaction.find({ userId: id }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.status(200).json({
      user,
      accounts,
      loans,
      recentTransactions: transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User KYC Status
 */
export const updateKycStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, reason, tier } = req.body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      throw UnprocessableEntity('Invalid KYC status. Must be VERIFIED or REJECTED.');
    }

    const user = await User.findById(id);
    if (!user) throw NotFound('User not found');

    user.kycStatus = status;
    if (tier !== undefined) user.kycTier = tier;
    if (status === 'VERIFIED') user.status = 'ACTIVE';
    
    // In a real app we'd save the reason in a KycSubmission log
    await user.save();

    if (notificationService) {
      await notificationService.notifyKycUpdate(user._id.toString(), status as 'VERIFIED' | 'REJECTED');
    }

    res.status(200).json({ message: `KYC status updated to ${status}`, user });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Account Status (Freeze/Unfreeze)
 */
export const manageAccountStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'FROZEN', 'CLOSED'].includes(status)) {
      throw UnprocessableEntity('Invalid account status. Must be ACTIVE, FROZEN, or CLOSED.');
    }

    const account = await Account.findById(id);
    if (!account) throw NotFound('Account not found');

    account.status = status;
    await account.save();

    res.status(200).json({ message: `Account status updated to ${status}`, account });
  } catch (error) {
    next(error);
  }
};

/**
 * Export all transactions as CSV for administrative auditing
 */
export const exportTransactionsCSV = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).limit(10000);

    const headers = ['Date', 'Transaction ID', 'User ID', 'Account', 'Type', 'Amount', 'Currency', 'Status', 'Merchant/Description'];
    const rows = transactions.map(tx => [
      tx.createdAt ? tx.createdAt.toISOString() : '',
      tx.transactionId,
      tx.userId.toString(),
      tx.accountId.toString(),
      tx.type,
      (tx.amount / 100).toFixed(2),
      tx.currency,
      tx.status,
      `"${(tx.merchantName || 'STARK INTERNAL').replace(/"/g, '""')}"` // Escape quotes
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stark_transactions_export.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
