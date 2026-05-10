import mongoose from 'mongoose';
import { User } from '../models/User';
import { Session } from '../models/Session';

describe('Models Unit Tests', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found in environment');
    }
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe('User Model', () => {
    it('should hash password on save', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        passwordHash: 'plainpassword',
      };
      
      const user = new User(userData);
      await user.save();
      
      expect(user.passwordHash).not.toBe('plainpassword');
      expect(user.passwordHash.length).toBeGreaterThan(20);
    });

    it('should correctly compare password', async () => {
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeDefined();
      
      const isMatch = await user!.comparePassword('plainpassword');
      const isNotMatch = await user!.comparePassword('wrongpassword');
      
      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });

    it('should enforce unique email constraint', async () => {
      const duplicateUser = new User({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john@example.com', // Duplicate email
        phone: '0987654321',
        passwordHash: 'anotherpassword',
      });
      
      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('Session Model', () => {
    it('should create a session linked to a user', async () => {
      const user = await User.findOne({ email: 'john@example.com' });
      
      const sessionData = {
        userId: user!._id,
        token: 'test-token-123',
        deviceFingerprint: 'browser-fingerprint',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };
      
      const session = new Session(sessionData);
      await session.save();
      
      const foundSession = await Session.findOne({ token: 'test-token-123' }).populate('userId');
      expect(foundSession).toBeDefined();
      expect(foundSession!.userId).toBeDefined();
      expect((foundSession!.userId as any).email).toBe('john@example.com');
    });
  });
});
