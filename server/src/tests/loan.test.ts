import mongoose from 'mongoose';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { Loan } from '../models/Loan';
import { Transaction } from '../models/Transaction';
import { makeRequest, createAuthHeader } from './helpers';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('Loan & Credit Integration Tests', () => {
  let token: string;
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
    await Account.deleteMany({});
    await Transaction.deleteMany({});
    await Loan.deleteMany({});

    const user = new User({
      firstName: 'Loan',
      lastName: 'User',
      email: 'loan@test.com',
      phone: '1112223333',
      passwordHash: 'hash',
      kycStatus: 'VERIFIED',
    });
    await user.save();
    userId = user._id.toString();
    token = jwt.sign({ userId, jti: 'l1' }, env.JWT_SECRET);
    
    const { Session } = await import('../models/Session');
    await new Session({ 
      userId, token: 'l1', deviceFingerprint: 'f', ipAddress: '1',
      expiresAt: new Date(Date.now() + 3600*1000)
    }).save();

    const acc = new Account({
      userId,
      accountNumber: '1234567890',
      type: 'SAVINGS',
      currency: 'USD',
      balance: 100000,
    });
    await acc.save();
    accountId = acc._id.toString();
  });

  describe('GET /api/v1/loans/products', () => {
    it('should return a list of loan products', async () => {
      const res = await makeRequest().get('/api/v1/loans/products').set(createAuthHeader(token));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('productType');
    });
  });

  describe('POST /api/v1/loans/apply', () => {
    it('should successfully apply and auto-disburse to verified user', async () => {
      const amount = 500000; // 5,000.00
      const res = await makeRequest()
        .post('/api/v1/loans/apply')
        .set(createAuthHeader(token))
        .send({
          productType: 'QUICK_LOAN',
          amount,
          disbursementAccountId: accountId,
        });

      expect(res.status).toBe(201);
      expect(res.body.loan.status).toBe('ACTIVE');
      expect(res.body.loan.principalAmount).toBe(amount);

      // Verify account was credited
      const acc = await Account.findById(accountId);
      expect(acc!.balance).toBe(100000 + amount);

      // Verify transaction record
      const tx = await Transaction.findOne({ userId, category: 'LOAN', type: 'CREDIT' });
      expect(tx).toBeDefined();
      expect(tx!.amount).toBe(amount);
    });

    it('should reject application if user has active loan of same type', async () => {
      await new Loan({ 
        userId, productType: 'QUICK_LOAN', principalAmount: 1000, interestRate: 10, 
        tenureMonths: 1, monthlyPayment: 1100, outstandingBalance: 1100, status: 'ACTIVE' 
      }).save();

      const res = await makeRequest()
        .post('/api/v1/loans/apply')
        .set(createAuthHeader(token))
        .send({
          productType: 'QUICK_LOAN',
          amount: 1000,
          disbursementAccountId: accountId,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toContain('active loan');
    });
  });

  describe('POST /api/v1/loans/repay', () => {
    it('should decrease outstanding balance and account balance on repayment', async () => {
      const loan = await new Loan({ 
        userId, productType: 'QUICK_LOAN', principalAmount: 10000, interestRate: 10, 
        tenureMonths: 1, monthlyPayment: 11000, outstandingBalance: 11000, status: 'ACTIVE' 
      }).save();

      const repayAmount = 5000;
      const res = await makeRequest()
        .post('/api/v1/loans/repay')
        .set(createAuthHeader(token))
        .send({
          loanId: loan._id,
          accountId,
          amount: repayAmount,
        });

      expect(res.status).toBe(200);
      expect(res.body.loan.outstandingBalance).toBe(6000);
      
      const acc = await Account.findById(accountId);
      expect(acc!.balance).toBe(100000 - repayAmount);

      const tx = await Transaction.findOne({ userId, category: 'LOAN', type: 'DEBIT' });
      expect(tx!.amount).toBe(repayAmount);
    });

    it('should mark loan as REPAID when outstanding reach zero', async () => {
      const loan = await new Loan({ 
        userId, productType: 'QUICK_LOAN', principalAmount: 10000, interestRate: 10, 
        tenureMonths: 1, monthlyPayment: 11000, outstandingBalance: 5000, status: 'ACTIVE' 
      }).save();

      const res = await makeRequest()
        .post('/api/v1/loans/repay')
        .set(createAuthHeader(token))
        .send({
          loanId: loan._id,
          accountId,
          amount: 6000, // Over-payment to trigger full repayment
        });

      expect(res.status).toBe(200);
      expect(res.body.loan.status).toBe('REPAID');
      expect(res.body.loan.outstandingBalance).toBe(0);
    });
  });
});
