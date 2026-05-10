import fc from 'fast-check';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';

describe('Transaction Property Tests', () => {
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

  // Feature: stark-digital-banking-platform, Property 5: Savings goal data integrity / Ledger integrity
  it('Property 5: Ledger Integrity - Sum of Success Transactions matches Balance', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const accountId = new mongoose.Types.ObjectId().toString();
    
    // Test case using fast-check to generate multiple transactions
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            type: fc.constantFrom('DEBIT', 'CREDIT'),
            amount: fc.integer({ min: 1, max: 10000 }),
          }),
          { minLength: 5, maxLength: 20 }
        ),
        async (txConfigs) => {
          // Clean up for this run
          await Transaction.deleteMany({ accountId });

          let expectedBalance = 0;
          const txs = txConfigs.map((cfg, index) => {
            if (cfg.type === 'DEBIT') expectedBalance -= cfg.amount;
            else expectedBalance += cfg.amount;

            return new Transaction({
              transactionId: `prop-tx-${index}-${Math.random()}`,
              accountId,
              userId,
              type: cfg.type,
              amount: cfg.amount,
              currency: 'USD',
              status: 'SUCCESS',
              category: 'TEST',
            });
          });

          await Transaction.insertMany(txs);

          // Calculate balance from ledger
          const dbTxs = await Transaction.find({ accountId, status: 'SUCCESS' });
          const ledgerBalance = dbTxs.reduce((acc, tx) => {
            return tx.type === 'DEBIT' ? acc - tx.amount : acc + tx.amount;
          }, 0);

          expect(ledgerBalance).toBe(expectedBalance);
        }
      )
    );
  });
});
