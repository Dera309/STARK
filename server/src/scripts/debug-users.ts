import mongoose from 'mongoose';
import { User } from '../models/User';

export const debugUsers = async () => {
  try {
    console.log('🔍 Debugging user database...');

    const users = await User.find({}, 'email status kycStatus failedLoginAttempts lockedUntil passwordHash').lean();

    console.log(`Found ${users.length} users:`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   KYC Status: ${user.kycStatus}`);
      console.log(`   Failed Attempts: ${user.failedLoginAttempts}`);
      console.log(`   Locked Until: ${user.lockedUntil}`);
      console.log(`   Password Hash: ${user.passwordHash ? user.passwordHash.substring(0, 20) + '...' : 'null'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error debugging users:', error);
  }
};

// Run debug if this script is executed directly
if (require.main === module) {
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stark')
    .then(async () => {
      console.log('📡 Connected to MongoDB');
      await debugUsers();
      await mongoose.disconnect();
      console.log('📴 Disconnected from MongoDB');
    })
    .catch(console.error);
}