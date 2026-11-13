// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { mintPass, PASS_TTL_MS, readPass } from './qr';

describe('rolling QR pass', () => {
  it('accepts a fresh token for its claim', () => {
    const now = 1_000_000;
    const { token, expiresAt } = mintPass('claim_7', now);
    expect(expiresAt).toBe(now + PASS_TTL_MS);
    expect(readPass(token, now + 1000)).toEqual({ ok: true, claimId: 'claim_7' });
  });

  it('refuses an old token, such as a screenshot', () => {
    const now = 1_000_000;
    const { token } = mintPass('claim_7', now);
    expect(readPass(token, now + PASS_TTL_MS + 60_000)).toEqual({ ok: false, reason: 'expired' });
  });

  it('refuses a token pointed at another claim', () => {
    const { token } = mintPass('claim_7');
    const forged = token.replace('claim_7', 'claim_8');
    expect(readPass(forged)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('refuses a token with its expiry pushed back', () => {
    const now = 1_000_000;
    const { token, expiresAt } = mintPass('claim_7', now);
    const stretched = token.replace(String(expiresAt), String(expiresAt + 600_000));
    expect(readPass(stretched, now + 120_000)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('refuses text that is not a MyPerkify pass', () => {
    expect(readPass('https://example.com')).toEqual({ ok: false, reason: 'invalid' });
  });
});
