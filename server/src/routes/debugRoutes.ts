// Temporary debug endpoint to test user lookup without password
import express from 'express';
import { User } from '../models/User';

const debugRouter = express.Router();

debugRouter.post('/debug-login', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    console.log('Debug login attempt for:', normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', {
      email: user.email,
      status: user.status,
      kycStatus: user.kycStatus,
      hasPassword: !!user.passwordHash,
      passwordHashStart: user.passwordHash?.substring(0, 10)
    });

    // Try to compare a known password
    const testResult = await user.comparePassword('password123');
    console.log('Password test result:', testResult);

    return res.json({
      user: {
        email: user.email,
        status: user.status,
        kycStatus: user.kycStatus
      },
      passwordTest: testResult
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default debugRouter;