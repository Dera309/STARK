import { Response, NextFunction } from 'express';
import { Account, generateAccountNumber } from '../models/Account';
import { AuthRequest } from '../middleware/auth';
import { UnprocessableEntity, Forbidden } from '../middleware/errorHandler';
import { io } from '../socket';

/**
 * List all accounts for the authenticated user
 */
export const listAccounts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const accounts = await Account.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(accounts);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new account for the authenticated user
 */
export const createAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { type, currency } = req.body;

    // 1. Check KYC Status
    if (user.kycStatus !== 'VERIFIED') {
      throw Forbidden('Your account must be VERIFIED before you can open a new bank account.');
    }

    // 2. Validate account type
    if (!['SAVINGS', 'CURRENT', 'DOMICILIARY', 'FIXED_DEPOSIT'].includes(type)) {
      throw UnprocessableEntity('Invalid account type');
    }

    // 3. Handle Domiciliary currency requirement
    if (type === 'DOMICILIARY' && !currency) {
      throw UnprocessableEntity('Currency is required for Domiciliary accounts');
    }

    // 4. Create account
    const accountNumber = generateAccountNumber();
    
    const account = new Account({
      userId: user._id,
      accountNumber,
      type,
      currency: type === 'DOMICILIARY' ? currency : 'USD',
      balance: 0, // Initial balance is zero
      status: 'ACTIVE',
    });

    await account.save();

    // 5. Emit socket event for real-time update
    io.to(`user:${user._id}`).emit('account:created', account);

    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
};
