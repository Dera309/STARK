import mongoose, { Schema, Document } from 'mongoose';
import { Session as SessionInterface } from '@shared/index';

export interface SessionDocument extends Omit<SessionInterface, '_id' | 'createdAt'>, Document {}

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    token: { type: String, required: true, index: true },
    deviceFingerprint: { type: String, required: true },
    ipAddress: { type: String, required: true },
    isImpersonation: { type: Boolean, default: false },
    impersonatedByAdminId: { type: Schema.Types.ObjectId as any, ref: 'User', default: null },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index — expires at the value of expiresAt
    invalidatedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt for sessions
  }
);

export const Session = mongoose.model<SessionDocument>('Session', sessionSchema);
export default Session;
