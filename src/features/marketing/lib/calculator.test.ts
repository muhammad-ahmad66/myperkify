import { describe, expect, it } from 'vitest';
import { calculateEarnings } from './calculator';

describe('calculateEarnings', () => {
  it('matches the worked example in the docs', () => {
    expect(calculateEarnings(240, 1200)).toEqual({
      sales: 288000,
      commission: 14400,
      keep: 273600,
      ordersBetweenSettlements: 34,
    });
  });

  it('rounds settlement frequency up', () => {
    expect(calculateEarnings(100, 700).ordersBetweenSettlements).toBe(58);
  });
});
