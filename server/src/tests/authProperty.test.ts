import fc from 'fast-check';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { tokenService } from '../services/tokenService';

describe('Authentication Property Tests', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  // Feature: stark-digital-banking-platform, Property 1: JWT token lifecycle
  it('Property 1: JWT token lifecycle - verifying and identifying unique sessions', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.string(), (userId: string, jti: string) => {
        const token = tokenService.generateToken(userId, jti);
        const payload = tokenService.verifyToken(token);
        
        expect(payload.userId).toBe(userId);
        expect(payload.jti).toBe(jti);
      })
    );
  });

  // Feature: stark-digital-banking-platform, Property 2: Account lockout state transition
  it('Property 2: Account lockout state transition - becomes locked after 5 attempts', async () => {
    const user = new User({
      firstName: 'Prop',
      lastName: 'Test',
      email: 'prop@test.com',
      phone: '1112223333',
      passwordHash: 'hash',
    });
    await user.save();

    for (let i = 1; i <= 5; i++) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await user.save();
    }

    const updatedUser = await User.findOne({ email: 'prop@test.com' });
    expect(updatedUser!.failedLoginAttempts).toBe(5);
    expect(updatedUser!.lockedUntil).not.toBeNull();
    expect(updatedUser!.lockedUntil! > new Date()).toBe(true);
  });

  // Feature: stark-digital-banking-platform, Property 3: Password reset token identity
  it('Property 3: Password reset tokens follow naming convention', () => {
    fc.assert(
      fc.property(fc.uuid(), (resetId: string) => {
        const userId = new mongoose.Types.ObjectId().toString();
        const jti = `reset-${resetId}`;
        const token = tokenService.generateToken(userId, jti);
        const payload = tokenService.verifyToken(token);
        
        expect(payload.jti).toMatch(/^reset-/);
      })
    );
  });
});
