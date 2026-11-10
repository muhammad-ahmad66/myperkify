import { describe, expect, it } from 'vitest';
import { dealFormSchema } from './schemas';

const valid = {
  type: 'in_store' as const,
  title: 'Large pizzas',
  description: 'Wood-fired pizzas at student prices.',
  categoryId: 'food',
  stampOffer: '25%',
  regularPrice: 2400,
  studentPrice: 1800,
  terms: '',
  status: 'draft' as const,
};

describe('dealFormSchema', () => {
  it('accepts a valid deal', () => {
    expect(dealFormSchema.safeParse(valid).success).toBe(true);
  });

  it('requires the student price to be below the regular price (F-504)', () => {
    const result = dealFormSchema.safeParse({ ...valid, studentPrice: 2400 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['studentPrice']);
  });
});
