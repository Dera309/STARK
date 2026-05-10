import mongoose, { Schema, Document } from 'mongoose';
import { FixedDeposit as FixedDepositInterface } from '@shared/index';

export interface FixedDepositDocument extends Omit<FixedDepositInterface, '_id' | 'createdAt' | 'updatedAt'>, Document {}

const fixedDepositSchema = new Schema<FixedDepositDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    depositRef: { type: String, required: true, unique: true, index: true },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    maturityDate: { type: Date, required: true, index: true },
    projectedMaturityAmount: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    sourceAccountId: { type: Schema.Types.ObjectId as any, ref: 'Account', required: true },
    destinationAccountId: { type: Schema.Types.ObjectId as any, ref: 'Account', required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'MATURED', 'LIQUIDATED'],
      default: 'ACTIVE',
    },
    earlyWithdrawalPenaltyRate: { type: Number, default: 0.5 }, // 50% of earned interest
  },
  {
    timestamps: true,
  }
);

export const FixedDeposit = mongoose.model<FixedDepositDocument>('FixedDeposit', fixedDepositSchema);
export default FixedDeposit;
