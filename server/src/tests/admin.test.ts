import mongoose from 'mongoose';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Account } from '../models/Account';
import { makeRequest, createAuthHeader } from './helpers';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('Admin Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;
  let accountId: string;

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
    await Role.deleteMany({});
    await Account.deleteMany({});

    // 1. Create Roles
    const adminRole = new Role({ name: 'ADMIN', permissions: ['*'] });
    await adminRole.save();
    const customerRole = new Role({ name: 'CUSTOMER', permissions: [] });
    await customerRole.save();

    // 2. Create Admin
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@stark.com',
      phone: '111',
      passwordHash: 'h',
      roleId: adminRole._id,
      kycStatus: 'VERIFIED',
    });
    await admin.save();
    adminId = admin._id.toString();
    adminToken = jwt.sign({ userId: adminId, jti: 'a1' }, env.JWT_SECRET);

    // 3. Create Normal User
    const user = new User({
      firstName: 'Normal',
      lastName: 'User',
      email: 'user@stark.com',
      phone: '222',
      passwordHash: 'h',
      roleId: customerRole._id,
      kycStatus: 'PENDING',
    });
    await user.save();
    userId = user._id.toString();
    userToken = jwt.sign({ userId, jti: 'u1' }, env.JWT_SECRET);

    // 4. Create Account
    const acc = new Account({
      userId,
      accountNumber: '9999999999',
      balance: 100,
    });
    await acc.save();
    accountId = acc._id.toString();

    // Mock Sessions
    const { Session } = await import('../models/Session');
    await Session.create([
      { userId: adminId, token: 'a1', deviceFingerprint: 'x', ipAddress: 'y', expiresAt: new Date(Date.now() + 100000) },
      { userId, token: 'u1', deviceFingerprint: 'x', ipAddress: 'y', expiresAt: new Date(Date.now() + 100000) }
    ]);
  });

  describe('RBAC Guards', () => {
    it('should reject non-admin access to admin routes', async () => {
      const res = await makeRequest()
        .get('/api/v1/admin/stats')
        .set(createAuthHeader(userToken));
      
      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('Admin privileges required');
    });

    it('should allow admin access to admin routes', async () => {
      const res = await makeRequest()
        .get('/api/v1/admin/stats')
        .set(createAuthHeader(adminToken));
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalUsers');
    });
  });

  describe('Administrative Actions', () => {
    it('should update user KYC status', async () => {
      const res = await makeRequest()
        .patch(`/api/v1/admin/users/${userId}/kyc`)
        .set(createAuthHeader(adminToken))
        .send({ status: 'VERIFIED', tier: 1 });

      expect(res.status).toBe(200);
      const updatedUser = await User.findById(userId);
      expect(updatedUser!.kycStatus).toBe('VERIFIED');
      expect(updatedUser!.status).toBe('ACTIVE');
    });

    it('should freeze customer account', async () => {
      const res = await makeRequest()
        .patch(`/api/v1/admin/accounts/${accountId}/status`)
        .set(createAuthHeader(adminToken))
        .send({ status: 'FROZEN' });

      expect(res.status).toBe(200);
      const updatedAcc = await Account.findById(accountId);
      expect(updatedAcc!.status).toBe('FROZEN');
    });

    it('should credit account (disburse funds)', async () => {
      const res = await makeRequest()
        .post('/api/v1/admin/accounts/credit')
        .set(createAuthHeader(adminToken))
        .send({ accountId, amount: 5000, reason: 'Test credit' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Account credited successfully');
      expect(res.body.account.balance).toBe(5100); // 100 initial + 5000 credit
      
      const updatedAcc = await Account.findById(accountId);
      expect(updatedAcc!.balance).toBe(5100);
    });

    it('should debit account (remove funds)', async () => {
      const res = await makeRequest()
        .post('/api/v1/admin/accounts/debit')
        .set(createAuthHeader(adminToken))
        .send({ accountId, amount: 50, reason: 'Test debit' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Account debited successfully');
      expect(res.body.account.balance).toBe(50); // 100 initial - 50 debit
      
      const updatedAcc = await Account.findById(accountId);
      expect(updatedAcc!.balance).toBe(50);
    });

    it('should reject debit when insufficient funds', async () => {
      const res = await makeRequest()
        .post('/api/v1/admin/accounts/debit')
        .set(createAuthHeader(adminToken))
        .send({ accountId, amount: 200, reason: 'Excess debit' });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('Insufficient funds');
    });

    it('should suspend user account', async () => {
      const res = await makeRequest()
        .patch(`/api/v1/admin/users/${userId}/status`)
        .set(createAuthHeader(adminToken))
        .send({ status: 'SUSPENDED' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('suspended');
      
      const updatedUser = await User.findById(userId);
      expect(updatedUser!.status).toBe('SUSPENDED');
    });

    it('should reactivate suspended user', async () => {
      await User.findByIdAndUpdate(userId, { status: 'SUSPENDED' });
      
      const res = await makeRequest()
        .patch(`/api/v1/admin/users/${userId}/status`)
        .set(createAuthHeader(adminToken))
        .send({ status: 'ACTIVE' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('reactivated');
      
      const updatedUser = await User.findById(userId);
      expect(updatedUser!.status).toBe('ACTIVE');
    });

    it('should close account with zero balance', async () => {
      await Account.findByIdAndUpdate(accountId, { balance: 0 });
      
      const res = await makeRequest()
        .patch(`/api/v1/admin/accounts/${accountId}/close`)
        .set(createAuthHeader(adminToken))
        .send({ reason: 'Account closure requested' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Account closed successfully');
      
      const updatedAcc = await Account.findById(accountId);
      expect(updatedAcc!.status).toBe('CLOSED');
    });

    it('should reject account closure with remaining balance', async () => {
      await Account.findByIdAndUpdate(accountId, { balance: 100 });
      
      const res = await makeRequest()
        .patch(`/api/v1/admin/accounts/${accountId}/close`)
        .set(createAuthHeader(adminToken))
        .send({ reason: 'Attempted closure' });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('Cannot close account with remaining balance');
    });

    it('should export transactions as CSV', async () => {
      const res = await makeRequest()
        .get('/api/v1/admin/export/transactions')
        .set(createAuthHeader(adminToken));

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.text).toContain('Date,Transaction ID,User ID,Account,Type,Amount,Currency,Status,Merchant/Description');
    });

    it('should export transactions with date filters', async () => {
      const futureDate = new Date(Date.now() + 10000).toISOString();
      const res = await makeRequest()
        .get(`/api/v1/admin/export/transactions?startDate=${futureDate}`)
        .set(createAuthHeader(adminToken));

      expect(res.status).toBe(200);
      // Should handle empty results gracefully if no transactions match
      expect(res.text.split('\n').length).toBe(1); // Only headers
    });
  });
});
