import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const fixPlainTextPasswords = async () => {
  try {
    console.log('🔄 Checking for plain text passwords in user database...');

    const users = await User.find({});
    let fixedCount = 0;

    for (const user of users) {
      // Check if passwordHash looks like plain text (not a bcrypt hash)
      // bcrypt hashes start with $2a$, $2b$, or $2y$
      if (user.passwordHash && !user.passwordHash.startsWith('$2')) {
        console.log(`📝 Fixing password for user: ${user.email}`);

        // Hash the plain text password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.passwordHash, salt);

        // Update the user
        await User.updateOne(
          { _id: user._id },
          { $set: { passwordHash: hashedPassword } }
        );

        fixedCount++;
      }
    }

    console.log(`✅ Fixed ${fixedCount} plain text passwords`);

  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stark')
    .then(async () => {
      console.log('📡 Connected to MongoDB');
      await fixPlainTextPasswords();
      await mongoose.disconnect();
      console.log('📴 Disconnected from MongoDB');
    })
    .catch(console.error);
}