import mongoose from 'mongoose';
import { User } from '../models/User';

export const fixUserStatuses = async () => {
  try {
    console.log('🔄 Fixing user statuses based on KYC verification...');

    // Update users who have VERIFIED KYC but are still PENDING_KYC status
    const result = await User.updateMany(
      { kycStatus: 'VERIFIED', status: 'PENDING_KYC' },
      { $set: { status: 'ACTIVE' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users from PENDING_KYC to ACTIVE`);

    // Reset failed login attempts for users who successfully login later
    const resetResult = await User.updateMany(
      { failedLoginAttempts: { $gt: 0 } },
      { $set: { failedLoginAttempts: 0, lockedUntil: null } }
    );

    console.log(`✅ Reset failed login attempts for ${resetResult.modifiedCount} users`);

  } catch (error) {
    console.error('❌ Error fixing user statuses:', error);
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stark')
    .then(async () => {
      console.log('📡 Connected to MongoDB');
      await fixUserStatuses();
      await mongoose.disconnect();
      console.log('📴 Disconnected from MongoDB');
    })
    .catch(console.error);
}