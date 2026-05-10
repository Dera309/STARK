import mongoose from 'mongoose';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { makeRequest, createAuthHeader } from './helpers';

describe('Authentication Flow Integration Tests', () => {
  let authToken: string;
  let testUser: any;
  const deviceFingerprint = 'test-device-123';

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

    // Create a test user
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      passwordHash: 'password123',
      status: 'ACTIVE',
    });
    await testUser.save();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await makeRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
          deviceFingerprint,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
      
      authToken = res.body.token;

      // Verify session created
      const session = await Session.findOne({ userId: testUser._id });
      expect(session).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const res = await makeRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
          deviceFingerprint,
        });

      expect(res.status).toBe(401);
      
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user!.failedLoginAttempts).toBe(1);
    });

    it('should lock account after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await makeRequest()
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
            deviceFingerprint,
          });
      }

      const res = await makeRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
          deviceFingerprint,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('locked');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      // Login first
      const loginRes = await makeRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
          deviceFingerprint,
        });
      
      const token = loginRes.body.token;

      const res = await makeRequest()
        .post('/api/v1/auth/logout')
        .set(createAuthHeader(token))
        .send();

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');

      // Verify session invalidated
      const session = await Session.findOne({ userId: testUser._id });
      expect(session!.invalidatedAt).not.toBeNull();
    });

    it('should fail to access protected route after logout', async () => {
      const loginRes = await makeRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
          deviceFingerprint,
        });
      
      const token = loginRes.body.token;

      await makeRequest()
        .post('/api/v1/auth/logout')
        .set(createAuthHeader(token))
        .send();

      const res = await makeRequest()
        .post('/api/v1/auth/logout') // Try to logout again
        .set(createAuthHeader(token))
        .send();

      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain('Session invalid');
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset', async () => {
      const res = await makeRequest()
        .post('/api/v1/auth/reset-password/request')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('sent');
    });

    it('should fail to confirm reset with invalid token', async () => {
      const res = await makeRequest()
        .post('/api/v1/auth/reset-password/confirm')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        });

      expect(res.status).toBe(401);
    });
  });
});
