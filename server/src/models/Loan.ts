import mongoose, { Schema, Document } from 'mongoose';
import { Loan as LoanInterface } from '@shared/index';

export interface LoanDocument extends Omit<LoanInterface, '_id' | 'createdAt' | 'updatedAt'>, Document {}

const loanSchema = new Schema<LoanDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    productType: {
      type: String,
      enum: ['QUICK_LOAN', 'SALARY_ADVANCE', 'DEVICE_FINANCING'],
      required: true,
    },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    monthlyPayment: { type: Number, required: true },
    outstandingBalance: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'ACTIVE', 'REPAID', 'DEFAULTED', 'REJECTED'],
      default: 'PENDING',
    },
    disbursedToAccountId: { type: Schema.Types.ObjectId as any, ref: 'Account', default: null },
    nextRepaymentDate: { type: Date, default: null },
    approvedByAdminId: { type: Schema.Types.ObjectId as any, ref: 'User', default: null },
  },
  {
    timestamps: true,
  }
);

export const Loan = mongoose.model<LoanDocument>('Loan', loanSchema);
export default Loan;
