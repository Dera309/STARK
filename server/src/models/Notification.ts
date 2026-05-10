import mongoose, { Schema, Document } from 'mongoose';
import { Notification as NotificationInterface } from '@shared/index';

export interface NotificationDocument extends Omit<NotificationInterface, '_id'>, Document {}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['TRANSACTION', 'LOW_BALANCE', 'LOAN_REMINDER', 'FD_MATURITY', 'SECURITY_ALERT', 'KYC_UPDATE', 'SYSTEM'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    channel: {
      type: String,
      enum: ['IN_APP', 'EMAIL', 'BOTH'],
      default: 'IN_APP',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification = mongoose.model<NotificationDocument>('Notification', notificationSchema);
export default Notification;
