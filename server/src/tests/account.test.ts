import mongoose from 'mongoose';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { makeRequest, createAuthHeader } from './helpers';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('Account Management Integration Tests', () => {
  let verifiedToken: string;
  let unverifiedToken: string;
  let verifiedUserId: string;

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
    await Account.deleteMany({});

    // Create a verified user
    const verifiedUser = new User({
      firstName: 'Verified',
      lastName: 'User',
      email: 'verified@test.com',
      phone: '1112223333',
      passwordHash: 'hash',
      kycStatus: 'VERIFIED',
    });
    await verifiedUser.save();
    verifiedUserId = verifiedUser._id.toString();
    verifiedToken = jwt.sign({ userId: verifiedUserId, jti: 'test-jti-1' }, env.JWT_SECRET);
    
    // Manual session creation to satisfy middleware
    const { Session } = await import('../models/Session');
    await new Session({ 
      userId: verifiedUserId, 
      token: 'test-jti-1', 
      deviceFingerprint: 'test', 
      ipAddress: '127.0.0.1',
      expiresAt: new Date(Date.now() + 3600*1000)
    }).save();

    // Create an unverified user
    const unverifiedUser = new User({
      firstName: 'Unverified',
      lastName: 'User',
      email: 'unverified@test.com',
      phone: '4445556666',
      passwordHash: 'hash',
      kycStatus: 'NONE',
    });
    await unverifiedUser.save();
    const unverifiedUserId = unverifiedUser._id.toString();
    unverifiedToken = jwt.sign({ userId: unverifiedUserId, jti: 'test-jti-2' }, env.JWT_SECRET);
    await new Session({ 
      userId: unverifiedUserId, 
      token: 'test-jti-2', 
      deviceFingerprint: 'test', 
      ipAddress: '127.0.0.1',
      expiresAt: new Date(Date.now() + 3600*1000)
    }).save();
  });

  describe('GET /api/v1/accounts', () => {
    it('should return an empty list when user has no accounts', async () => {
      const res = await makeRequest()
        .get('/api/v1/accounts')
        .set(createAuthHeader(verifiedToken));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return list of accounts when they exist', async () => {
      await new Account({
        userId: verifiedUserId,
        accountNumber: '1000000001',
        type: 'SAVINGS',
        currency: 'USD',
        balance: 1000,
      }).save();

      const res = await makeRequest()
        .get('/api/v1/accounts')
        .set(createAuthHeader(verifiedToken));

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].accountNumber).toBe('1000000001');
    });
  });

  describe('POST /api/v1/accounts', () => {
    it('should create a SAVINGS account for a verified user', async () => {
      const res = await makeRequest()
        .post('/api/v1/accounts')
        .set(createAuthHeader(verifiedToken))
        .send({ type: 'SAVINGS' });

      expect(res.status).toBe(201);
      expect(res.body.type).toBe('SAVINGS');
      expect(res.body.currency).toBe('USD');
      expect(res.body.accountNumber).toHaveLength(10);
    });

    it('should create a DOMICILIARY account with specified currency', async () => {
      const res = await makeRequest()
        .post('/api/v1/accounts')
        .set(createAuthHeader(verifiedToken))
        .send({ type: 'DOMICILIARY', currency: 'USD' });

      expect(res.status).toBe(201);
      expect(res.body.type).toBe('DOMICILIARY');
      expect(res.body.currency).toBe('USD');
    });

    it('should reject account creation for unverified user', async () => {
      const res = await makeRequest()
        .post('/api/v1/accounts')
        .set(createAuthHeader(unverifiedToken))
        .send({ type: 'SAVINGS' });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('VERIFIED');
    });

    it('should reject DOMICILIARY account without currency', async () => {
      const res = await makeRequest()
        .post('/api/v1/accounts')
        .set(createAuthHeader(verifiedToken))
        .send({ type: 'DOMICILIARY' });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('Currency is required');
    });
  });
});
