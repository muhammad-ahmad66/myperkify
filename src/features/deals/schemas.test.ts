import { describe, expect, it } from 'vitest';
import { dealPricingSchema } from './schemas';

describe('dealPricingSchema', () => {
  it('accepts locked pricing with the regular price only', () => {
    expect(dealPricingSchema.parse({ access: 'locked', regularPrice: 2400 })).toEqual({
      access: 'locked',
      regularPrice: 2400,
    });
  });

  it('rejects a student price leaking into locked pricing', () => {
    const leaked = { access: 'locked', regularPrice: 2400, studentPrice: 1800 };
    expect(dealPricingSchema.safeParse(leaked).success).toBe(false);
  });

  it('requires the student price when unlocked', () => {
    expect(dealPricingSchema.safeParse({ access: 'unlocked', regularPrice: 2400 }).success).toBe(
      false,
    );
  });
});
