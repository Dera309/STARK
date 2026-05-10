import mongoose from 'mongoose';
import { User } from '../models/User';

async function checkUser() {
  try {
    console.log('Checking user existence and status...');

    // Check different email variations
    const emailVariations = [
      'john@example.com',
      'John@example.com',
      'JOHN@EXAMPLE.COM',
      'john@example.com ',
      ' john@example.com'
    ];

    for (const email of emailVariations) {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });

      if (user) {
        console.log(`User found for "${email}" (normalized: "${normalizedEmail}"):`);
        console.log('  Email:', user.email);
        console.log('  Status:', user.status);
        console.log('  KYC Status:', user.kycStatus);
        console.log('  Failed Attempts:', user.failedLoginAttempts);
        console.log('  Password hash exists:', !!user.passwordHash);
        return;
      }
    }

    console.log('No user found for any email variation');

    // List all users
    const allUsers = await User.find({}, 'email status kycStatus').limit(10);
    console.log('All users in database:');
    allUsers.forEach(user => {
      console.log(`  ${user.email} - ${user.status} - ${user.kycStatus}`);
    });

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
      await checkUser();
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    })
    .catch(console.error);
}