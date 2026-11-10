import { describe, expect, it } from 'vitest';
import { applicationDataSchema } from './schemas';

const branch = {
  name: 'Gulberg III',
  address: '12 Main Boulevard, Gulberg III',
  city: 'Lahore',
};

const valid = {
  tradingName: 'Crust & Co.',
  categoryId: 'food',
  redemption: 'in_store' as const,
  branches: [branch],
  ownerName: 'Sana Malik',
  email: 'sana@crustandco.pk',
  phone: '3001234567',
  acceptedCommission: true,
  acceptedTerms: true,
};

const issuePaths = (input: unknown) =>
  applicationDataSchema.safeParse(input).error?.issues.map((issue) => issue.path.join('.')) ?? [];

describe('applicationDataSchema', () => {
  it('accepts a complete application', () => {
    expect(applicationDataSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a branch for in-store shops, but not for online-only ones', () => {
    expect(issuePaths({ ...valid, branches: [] })).toContain('branches');
    expect(
      applicationDataSchema.safeParse({
        ...valid,
        redemption: 'online',
        branches: [],
      }).success,
    ).toBe(true);
  });

  it('rejects a phone number in the wrong shape', () => {
    expect(issuePaths({ ...valid, phone: '12345' })).toContain('phone');
  });

  it('requires both agreements', () => {
    expect(issuePaths({ ...valid, acceptedCommission: false })).toContain('acceptedCommission');
  });
});
