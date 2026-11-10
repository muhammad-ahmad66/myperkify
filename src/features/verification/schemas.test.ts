import { describe, expect, it } from 'vitest';
import { CARD_MAX_BYTES } from '@/lib/constants';
import { accountSchema, validateCardFile } from './schemas';

const valid = {
  name: 'Ayesha Khan',
  universityId: 'lums',
  method: 'email' as const,
  email: ' Ayesha.K@lums.edu.pk ',
  acceptedTerms: true,
};

describe('accountSchema', () => {
  it('accepts a university email and normalises it', () => {
    expect(accountSchema.parse(valid).email).toBe('ayesha.k@lums.edu.pk');
  });

  it('blocks a personal email for the email method', () => {
    const result = accountSchema.safeParse({ ...valid, email: 'ayesha@gmail.com' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['email']);
  });

  it('allows any email for the card method', () => {
    expect(
      accountSchema.safeParse({ ...valid, method: 'card', email: 'ayesha@gmail.com' }).success,
    ).toBe(true);
  });

  it('requires the terms box', () => {
    expect(accountSchema.safeParse({ ...valid, acceptedTerms: false }).success).toBe(false);
  });
});

describe('validateCardFile', () => {
  it('accepts a small JPG', () => {
    expect(validateCardFile({ type: 'image/jpeg', size: 1000 })).toBeNull();
  });

  it('rejects other file types and large files with a specific message', () => {
    expect(validateCardFile({ type: 'application/pdf', size: 1000 })).toMatch(/JPG or PNG/);
    expect(validateCardFile({ type: 'image/png', size: CARD_MAX_BYTES + 1 })).toMatch(/5 MB/);
  });
});
