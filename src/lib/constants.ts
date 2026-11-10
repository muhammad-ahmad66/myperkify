/** Business values used for display on marketing surfaces. The server stays the authority. */
export const COMMISSION_RATE = 0.05;
export const SETTLEMENT_THRESHOLD = 2000;

export const CLAIM_POLL_MS = 3000;
export const VERIFICATION_POLL_MS = 5000;
export const RESEND_SECONDS = 45;
export const VERIFICATION_CODE_LENGTH = 6;
export const CLAIM_WINDOW_SECONDS = 300;

export const CARD_MAX_BYTES = 5 * 1024 * 1024;
export const CARD_MIME_TYPES = ['image/jpeg', 'image/png'] as const;
