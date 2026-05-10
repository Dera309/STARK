import mongoose, { Schema, Document } from 'mongoose';
import { Transaction as TransactionInterface } from '@shared/index';

export interface TransactionDocument extends Omit<TransactionInterface, '_id' | 'updatedAt'>, Document {}

const transactionSchema = new Schema<TransactionDocument>(
  {
    transactionId: { type: String, required: true, unique: true },
    accountId: { type: Schema.Types.ObjectId as any, ref: 'Account', required: true, index: true },
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['DEBIT', 'CREDIT', 'TRANSFER', 'REFUND', 'ADMIN_CREDIT', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'FD_DEBIT', 'FD_CREDIT'],
      required: true,
    },
    amount: { type: Number, required: true }, // Minor units
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'FLAGGED', 'VOIDED', 'SUSPENDED'],
      default: 'SUCCESS',
    },
    category: { type: String, required: true },
    merchantName: { type: String, default: 'STARK INTERNAL' },
    counterpartyAccountId: { type: Schema.Types.ObjectId as any, ref: 'Account', default: null },
    counterpartyAccountNumber: { type: String, default: null },
    fee: { type: Number, default: 0 },
    failureReason: { type: String, default: null },
    initiatedBy: {
      type: String,
      enum: ['CUSTOMER', 'ADMIN', 'SYSTEM'],
      default: 'CUSTOMER',
    },
    adminId: { type: Schema.Types.ObjectId as any, ref: 'User', default: null },
    adminReason: { type: String, default: null },
    isHighValue: { type: Boolean, default: false },
    settlementId: { type: Schema.Types.ObjectId as any, ref: 'Settlement', default: null },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<TransactionDocument>('Transaction', transactionSchema);
export default Transaction;
