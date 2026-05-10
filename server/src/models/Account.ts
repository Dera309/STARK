import mongoose, { Schema, Document } from 'mongoose';
import { Account as AccountInterface } from '@shared/index';

export interface AccountDocument extends Omit<AccountInterface, '_id' | 'createdAt' | 'updatedAt'>, Document {}

const accountSchema = new Schema<AccountDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    accountNumber: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['SAVINGS', 'CURRENT', 'DOMICILIARY', 'FIXED_DEPOSIT'],
      default: 'SAVINGS',
    },
    currency: {
      type: String,
      enum: ['USD', 'GBP', 'EUR'],
      default: 'USD',
    },
    balance: { type: Number, default: 0 }, // Minor units (e.g., kobo for NGN)
    status: {
      type: String,
      enum: ['ACTIVE', 'FROZEN', 'CLOSED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generate a random 10-digit account number.
 * Note: In a production app, we would use a more robust sequential logic or 
 * a recursive check to ensuring uniqueness, but for this project we'll rely on 
 * an initial random generation and the unique index.
 */
export const generateAccountNumber = (): string => {
  return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
};

export const Account = mongoose.model<AccountDocument>('Account', accountSchema);
export default Account;
