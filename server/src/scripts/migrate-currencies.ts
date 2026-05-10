import mongoose from 'mongoose';
import { Account } from '../models/Account';

export const migrateSavingsAccountsToUSD = async () => {
  try {
    console.log('🔄 Migrating existing SAVINGS accounts to USD currency...');

    const result = await Account.updateMany(
      { type: 'SAVINGS', currency: 'NGN' },
      { $set: { currency: 'USD' } }
    );

    console.log(`✅ Migrated ${result.modifiedCount} savings accounts from NGN to USD`);

    // Also update any CURRENT accounts to USD if they exist
    const currentResult = await Account.updateMany(
      { type: 'CURRENT', currency: 'NGN' },
      { $set: { currency: 'USD' } }
    );

    console.log(`✅ Migrated ${currentResult.modifiedCount} current accounts from NGN to USD`);

  } catch (error) {
    console.error('❌ Error migrating accounts:', error);
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stark')
    .then(async () => {
      console.log('📡 Connected to MongoDB');
      await migrateSavingsAccountsToUSD();
      await mongoose.disconnect();
      console.log('📴 Disconnected from MongoDB');
    })
    .catch(console.error);
}