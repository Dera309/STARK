import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

async function checkPassword() {
  try {
    console.log('Checking password for john@example.com...');

    const user = await User.findOne({ email: 'john@example.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', {
      email: user.email,
      status: user.status,
      kycStatus: user.kycStatus,
      passwordHash: user.passwordHash?.substring(0, 20) + '...'
    });

    // Test various passwords
    const testPasswords = ['password123', 'Password123', 'password', '123456'];

    for (const testPass of testPasswords) {
      const isMatch = await bcrypt.compare(testPass, user.passwordHash);
      console.log(`Password "${testPass}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stark')
    .then(async () => {
      console.log('Connected to MongoDB');
      await checkPassword();
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    })
    .catch(console.error);
}