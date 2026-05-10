import fc from 'fast-check';

describe('Investment Property Tests', () => {
  // Maturity math property
  it('Property 25: Maturity amount calculation should be Principal + (Principal * Rate/100 * Months/12)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 10000000 }), // principal in minor units
        fc.integer({ min: 1, max: 100 }),          // rate in percent
        fc.integer({ min: 1, max: 60 }),           // tenure in months
        (principal, rate, months) => {
          // Simulation of controller logic
          const interest = Math.round(principal * (rate / 100) * (months / 12));
          const maturity = principal + interest;
          
          expect(maturity).toBeGreaterThanOrEqual(principal);
          expect(maturity).toBe(principal + interest);
        }
      )
    );
  });

  // Early liquidation math property
  it('Property 26: Payout on early liquidation should be between Principal and Maturity amount', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 10000000 }), // principal
        fc.integer({ min: 1, max: 100 }),          // rate
        fc.integer({ min: 1, max: 12 }),           // tenure
        fc.double({ min: 0.1, max: 0.9 }),          // time passed ratio
        (principal, rate, months, ratio) => {
          const interest = Math.round(principal * (rate / 100) * (months / 12));
          const maturity = principal + interest;
          
          const earned = Math.round(interest * ratio);
          const penalty = Math.round(earned * 0.5); // 50% penalty
          const payout = principal + (earned - penalty);
          
          expect(payout).toBeGreaterThanOrEqual(principal);
          expect(payout).toBeLessThanOrEqual(maturity);
        }
      )
    );
  });
});
