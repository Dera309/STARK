import mongoose, { Schema, Document } from 'mongoose';
import { Role as RoleInterface } from '@shared/index';

export interface RoleDocument extends Omit<RoleInterface, '_id' | 'createdAt' | 'updatedAt'>, Document {}

const roleSchema = new Schema<RoleDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    permissions: [{ type: String }],
    isBuiltIn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Role = mongoose.model<RoleDocument>('Role', roleSchema);
export default Role;
