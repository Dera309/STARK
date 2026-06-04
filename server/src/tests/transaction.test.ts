import mongoose from 'mongoose';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { makeRequest, createAuthHeader } from './helpers';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('Transaction & Transfer Integration Tests', () => {
  let senderToken: string;
  let senderAccountId: string;
  let recipientAccountId: string;
  let recipientAccountNumber: string;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');
    if (mongoose.connection.readyState === 0) {
      // For transactions, we must connect to the replica set URI
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

    // 1. Create Sender
    const sender = new User({
      firstName: 'Sender',
      lastName: 'User',
      email: 'sender@test.com',
      phone: '1111111111',
      passwordHash: 'hash',
      kycStatus: 'VERIFIED',
    });
    await sender.save();
    senderToken = jwt.sign({ userId: sender._id.toString(), jti: 's1' }, env.JWT_SECRET);
    
    const { Session } = await import('../models/Session');
    await new Session({ 
      userId: sender._id.toString(), 
      token: 's1', 
      deviceFingerprint: 'd', 
      ipAddress: '1',
      expiresAt: new Date(Date.now() + 3600*1000)
    }).save();

    const senderAcc = new Account({
      userId: sender._id,
      accountNumber: '0000000001',
      type: 'SAVINGS',
      currency: 'USD',
      balance: 100000, // 1,000.00
    });
    await senderAcc.save();
    senderAccountId = senderAcc._id.toString();

    // 2. Create Recipient
    const recipient = new User({
      firstName: 'Recipient',
      lastName: 'User',
      email: 'recipient@test.com',
      phone: '2222222222',
      passwordHash: 'hash',
      kycStatus: 'VERIFIED',
    });
    await recipient.save();
    
    const recipientAcc = new Account({
      userId: recipient._id,
      accountNumber: '9999999999',
      type: 'SAVINGS',
      currency: 'USD',
      balance: 0,
    });
    await recipientAcc.save();
    recipientAccountId = recipientAcc._id.toString();
    recipientAccountNumber = recipientAcc.accountNumber;
  });

  describe('POST /api/v1/transactions/transfer', () => {
    it('should successfully perform an internal transfer', async () => {
      const amount = 50000; // 500.00
      const res = await makeRequest()
        .post('/api/v1/transactions/transfer')
        .set(createAuthHeader(senderToken))
        .send({
          sourceAccountId: senderAccountId,
          targetAccountNumber: recipientAccountNumber,
          amount,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Transfer successful');

      // Verify balances
      const updatedSenderAcc = await Account.findById(senderAccountId);
      const updatedRecipientAcc = await Account.findById(recipientAccountId);

      expect(updatedSenderAcc!.balance).toBe(50000);
      expect(updatedRecipientAcc!.balance).toBe(50000);

      // Verify transaction records
      const txs = await Transaction.find();
      expect(txs.length).toBe(2);
      
      const debitTx = txs.find(t => t.type === 'DEBIT');
      const creditTx = txs.find(t => t.type === 'CREDIT');

      expect(debitTx!.amount).toBe(amount);
      expect(creditTx!.amount).toBe(amount);
      expect(debitTx!.counterpartyAccountNumber).toBe(recipientAccountNumber);
    });

    it('should reject transfer with insufficient funds', async () => {
      const res = await makeRequest()
        .post('/api/v1/transactions/transfer')
        .set(createAuthHeader(senderToken))
        .send({
          sourceAccountId: senderAccountId,
          targetAccountNumber: recipientAccountNumber,
          amount: 200000, // More than current 100,000
        });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('Insufficient funds');
      
      // Verify no money was moved
      const senderAcc = await Account.findById(senderAccountId);
      expect(senderAcc!.balance).toBe(100000);
    });

    it('should flag high-value transactions (>= 5,000.00)', async () => {
      // Give sender more money first
      await Account.findByIdAndUpdate(senderAccountId, { balance: 1000000 });

      const res = await makeRequest()
        .post('/api/v1/transactions/transfer')
        .set(createAuthHeader(senderToken))
        .send({
          sourceAccountId: senderAccountId,
          targetAccountNumber: recipientAccountNumber,
          amount: 600000, // 6,000.00
        });

      expect(res.status).toBe(200);
      
      const debitTx = await Transaction.findOne({ type: 'DEBIT', amount: 600000 });
      expect(debitTx!.isHighValue).toBe(true);
    });

    it('should reject transfer to an inactive target account', async () => {
      await Account.findByIdAndUpdate(recipientAccountId, { status: 'FROZEN' });

      const res = await makeRequest()
        .post('/api/v1/transactions/transfer')
        .set(createAuthHeader(senderToken))
        .send({
          sourceAccountId: senderAccountId,
          targetAccountNumber: recipientAccountNumber,
          amount: 1000,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('not active');
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should return paginated transaction history for the user', async () => {
      const sender = await User.findOne({ email: 'sender@test.com' });
      const senderId = sender!._id.toString();

      // Create some fake transactions
      await Transaction.create([
        { 
          transactionId: 't1', accountId: senderAccountId, userId: senderId, 
          type: 'CREDIT', amount: 100, currency: 'USD', status: 'SUCCESS', category: 'ADMIN', 
          merchantName: 'TEST' 
        },
        { 
          transactionId: 't2', accountId: senderAccountId, userId: senderId, 
          type: 'DEBIT', amount: 50, currency: 'USD', status: 'SUCCESS', category: 'TRANSFER', 
          merchantName: 'TEST' 
        }
      ]);

      const res = await makeRequest()
        .get('/api/v1/transactions?limit=1')
        .set(createAuthHeader(senderToken));

      expect(res.status).toBe(200);
      expect(res.body.transactions.length).toBe(1);
      expect(res.body.meta.total).toBe(2);
    });
  });

  describe('GET /api/v1/transactions/statement', () => {
    it('should generate and return a PDF statement', async () => {
      const res = await makeRequest()
        .get(`/api/v1/transactions/statement?accountId=${senderAccountId}`)
        .set(createAuthHeader(senderToken));

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.header['content-disposition']).toContain('attachment; filename=STARK_Statement_');
      
      // Basic PDF check (PDF files starts with %PDF-)
      expect(res.body.slice(0, 5).toString()).toBe('%PDF-');
    }, 10000); // Increase timeout for PDF generation

    it('should generate statement with period=3m parameter', async () => {
      const res = await makeRequest()
        .get(`/api/v1/transactions/statement?accountId=${senderAccountId}&period=3m`)
        .set(createAuthHeader(senderToken));

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 5).toString()).toBe('%PDF-');
    }, 10000);

    it('should generate statement with period=6m parameter', async () => {
      const res = await makeRequest()
        .get(`/api/v1/transactions/statement?accountId=${senderAccountId}&period=6m`)
        .set(createAuthHeader(senderToken));

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 5).toString()).toBe('%PDF-');
    }, 10000);

    it('should generate statement with period=1y parameter', async () => {
      const res = await makeRequest()
        .get(`/api/v1/transactions/statement?accountId=${senderAccountId}&period=1y`)
        .set(createAuthHeader(senderToken));

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.body.slice(0, 5).toString()).toBe('%PDF-');
    }, 10000);
  });
});
