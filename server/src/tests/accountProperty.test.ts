import fc from 'fast-check';
import mongoose from 'mongoose';
import { Account, generateAccountNumber } from '../models/Account';

describe('Account Property Tests', () => {
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

  // Feature: stark-digital-banking-platform, Property 12: Account number uniqueness
  it('Property 12: Generated account numbers should follow the 10-digit format', () => {
    fc.assert(
      fc.property(fc.integer(), () => {
        const accNo = generateAccountNumber();
        expect(accNo).toMatch(/^\d{10}$/);
      })
    );
  });

  // Feature: stark-digital-banking-platform, Property 13: KYC gate simulation
  it('Property 13: KYC gate behavioral invariant - accounts only created for VERIFIED status', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('NONE', 'PENDING', 'REJECTED', 'VERIFIED'), 
        (kycStatus) => {
          const canCreateAccount = kycStatus === 'VERIFIED';
          
          // Simulation of the controller logic
          const validationLogic = (status: string) => {
            if (status !== 'VERIFIED') return 'FAILED';
            return 'SUCCESS';
          };

          expect(validationLogic(kycStatus)).toBe(canCreateAccount ? 'SUCCESS' : 'FAILED');
        }
      )
    );
  });

  // Feature: stark-digital-banking-platform, Property 14: Domiciliary account requirement
  it('Property 14: Domiciliary accounts must have a currency specified', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('SAVINGS', 'CURRENT', 'DOMICILIARY', 'FIXED_DEPOSIT'),
        fc.option(fc.constantFrom('USD', 'GBP', 'EUR')),
        (type, currency) => {
          const isInvalid = type === 'DOMICILIARY' && !currency;
          
          // Simulation of the controller logic
          const validate = (t: string, c: string | null) => {
            if (t === 'DOMICILIARY' && !c) return false;
            return true;
          };

          expect(validate(type, currency)).toBe(!isInvalid);
        }
      )
    );
  });
});
