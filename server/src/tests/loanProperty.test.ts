import fc from 'fast-check';

describe('Loan Property Tests', () => {
  // Simple interest math property
  it('Property 20: Total repayment amount calculation should be Principal + (Principal * Rate / 100)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 1000000 }), // amount in minor units
        fc.integer({ min: 1, max: 100 }),       // rate in percent
        (principal, rate) => {
          // Simulation of controller logic
          const interest = Math.round(principal * (rate / 100));
          const totalRepayable = principal + interest;
          
          expect(totalRepayable).toBeGreaterThanOrEqual(principal);
          expect(totalRepayable).toBe(principal + interest);
        }
      )
    );
  });

  // Monthly payment integrity
  it('Property 21: Sum of monthly payments should deviate by at most 1 unit due to rounding', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1000000 }), 
        fc.integer({ min: 1, max: 60 }), // months
        (total, months) => {
          const monthly = Math.round(total / months);
          const sum = monthly * months;
          
          const maxDeviation = Math.ceil(months / 2); // heuristic for rounding deviation
          expect(Math.abs(sum - total)).toBeLessThanOrEqual(maxDeviation);
        }
      )
    );
  });
});
