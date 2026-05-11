import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as UserInterface } from '@shared/index';

export interface UserDocument extends Omit<UserInterface, '_id' | 'createdAt' | 'updatedAt' | 'roleId'>, Document {
  roleId: mongoose.Types.ObjectId | null;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    kycStatus: {
      type: String,
      enum: ['NONE', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'NONE',
    },
    kycTier: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'PENDING_KYC'],
      default: 'PENDING_KYC',
    },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    registeredDevices: [{ type: String }],
    savingsGoalTarget: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this as UserDocument;
  if (!user.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const user = this as UserDocument;
  return bcrypt.compare(password, user.passwordHash);
};

export const User = mongoose.model<UserDocument>('User', userSchema);
export default User;
