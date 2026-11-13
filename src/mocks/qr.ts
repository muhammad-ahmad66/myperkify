import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * The rolling QR on a student's voucher. Each token names one claim, expires 30 seconds after it
 * is made, and carries a signature only the server can produce, so a screenshot or a forged code
 * is refused. Tokens need no storage, which also suits hosts with several server instances.
 * The real backend should keep its secret in an environment variable, never in the code.
 */
export const PASS_TTL_MS = 30_000;
/** Time for a scan that started just before the token rolled over. */
const SCAN_GRACE_MS = 5_000;
const PREFIX = 'MP1';
const SECRET = process.env.MOCK_QR_SECRET ?? 'myperkify-mock-qr-secret';

function sign(claimId: string, expiresAt: number): string {
  return createHmac('sha256', SECRET)
    .update(`${claimId}.${expiresAt}`)
    .digest('base64url')
    .slice(0, 22);
}

export function mintPass(claimId: string, now = Date.now()): { token: string; expiresAt: number } {
  const expiresAt = now + PASS_TTL_MS;
  return { token: `${PREFIX}.${claimId}.${expiresAt}.${sign(claimId, expiresAt)}`, expiresAt };
}

export type PassCheck =
  { ok: true; claimId: string } | { ok: false; reason: 'invalid' | 'expired' };

export function readPass(token: string, now = Date.now()): PassCheck {
  const [prefix, claimId, expiry, signature] = token.trim().split('.');
  const expiresAt = Number(expiry);
  if (prefix !== PREFIX || !claimId || !signature || !Number.isFinite(expiresAt)) {
    return { ok: false, reason: 'invalid' };
  }
  const expected = Buffer.from(sign(claimId, expiresAt));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { ok: false, reason: 'invalid' };
  }
  if (now > expiresAt + SCAN_GRACE_MS) return { ok: false, reason: 'expired' };
  return { ok: true, claimId };
}
