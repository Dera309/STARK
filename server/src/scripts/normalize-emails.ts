import mongoose from 'mongoose';
import { User } from '../models/User';
import 'dotenv/config';

async function normalizeEmails() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stark';
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users to check.`);

    let updatedCount = 0;
    for (const user of users) {
      const originalEmail = user.email;
      const normalizedEmail = originalEmail.toLowerCase().trim();

      if (originalEmail !== normalizedEmail) {
        console.log(`Normalizing: ${originalEmail} -> ${normalizedEmail}`);
        user.email = normalizedEmail;
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Successfully normalized ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during normalization:', error);
    process.exit(1);
  }
}

normalizeEmails();
