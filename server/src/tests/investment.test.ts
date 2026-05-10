import mongoose from 'mongoose';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { FixedDeposit } from '../models/FixedDeposit';
import { Transaction } from '../models/Transaction';
import { makeRequest, createAuthHeader } from './helpers';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('Investment Integration Tests', () => {
  let token: string;
  let userId: string;
  let sourceAccountId: string;
  let destAccountId: string;

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
    await Transaction.deleteMany({});
    await FixedDeposit.deleteMany({});

    const user = new User({
      firstName: 'Investor',
      lastName: 'User',
      email: 'invest@test.com',
      phone: '5556667777',
      passwordHash: 'hash',
      kycStatus: 'VERIFIED',
    });
    await user.save();
    userId = user._id.toString();
    token = jwt.sign({ userId, jti: 'inv1' }, env.JWT_SECRET);
    
    const { Session } = await import('../models/Session');
    await new Session({ 
      userId, token: 'inv1', deviceFingerprint: 'f', ipAddress: '1',
      expiresAt: new Date(Date.now() + 3600*1000)
    }).save();

    const acc1 = new Account({
      userId,
      accountNumber: '1111111111',
      type: 'SAVINGS',
      currency: 'USD',
      balance: 1000000, // 10,000.00
    });
    await acc1.save();
    sourceAccountId = acc1._id.toString();

    const acc2 = new Account({
      userId,
      accountNumber: '2222222222',
      type: 'CURRENT',
      currency: 'USD',
      balance: 0,
    });
    await acc2.save();
    destAccountId = acc2._id.toString();
  });

  describe('POST /api/v v1/investments/fixed-deposit', () => {
    it('should successfully create FD and debit source account', async () => {
      const amount = 500000; // 5,000.00
      const res = await makeRequest()
        .post('/api/v1/investments/fixed-deposit')
        .set(createAuthHeader(token))
        .send({
          principalAmount: amount,
          interestRate: 15,
          tenureMonths: 12,
          sourceAccountId,
          destinationAccountId: destAccountId,
        });

      expect(res.status).toBe(201);
      expect(res.body.principalAmount).toBe(amount);
      expect(res.body.status).toBe('ACTIVE');

      // Verify source account debit
      const sourceAcc = await Account.findById(sourceAccountId);
      expect(sourceAcc!.balance).toBe(1000000 - amount);

      // Verify transaction record
      const tx = await Transaction.findOne({ userId, type: 'FD_DEBIT' });
      expect(tx!.amount).toBe(amount);
    });

    it('should reject FD if insufficient funds', async () => {
      const res = await makeRequest()
        .post('/api/v1/investments/fixed-deposit')
        .set(createAuthHeader(token))
        .send({
          principalAmount: 2000000,
          interestRate: 10,
          tenureMonths: 6,
          sourceAccountId,
          destinationAccountId: destAccountId,
        });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('Insufficient funds');
    });
  });

  describe('POST /api/v1/investments/liquidate', () => {
    it('should liquidate early with penalty', async () => {
      const amount = 500000;
      // Create FD manually
      const fd = new FixedDeposit({
        userId,
        depositRef: 'TEST-FD',
        principalAmount: amount,
        interestRate: 10,
        tenureMonths: 12,
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        projectedMaturityAmount: 550000,
        currentValue: amount,
        sourceAccountId,
        destinationAccountId: destAccountId,
        status: 'ACTIVE',
      });
      await fd.save();

      const res = await makeRequest()
        .post('/api/v1/investments/liquidate')
        .set(createAuthHeader(token))
        .send({ fdId: fd._id });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('LIQUIDATED');
      
      // Since it's liquidated immediately in the test, earned interest is ~0, penalty is ~0.
      // Payout should be close to principal.
      expect(res.body.payoutAmount).toBeGreaterThanOrEqual(amount);
      
      const destAcc = await Account.findById(destAccountId);
      expect(destAcc!.balance).toBeGreaterThanOrEqual(amount);
    });
  });
});
