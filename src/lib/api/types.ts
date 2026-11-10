export type ApiSuccess<T> = { data: T; meta?: { page: number; total: number } };

export type ApiFailure = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export const API_ERROR_CODES = {
  network: 'NETWORK_ERROR',
  timeout: 'TIMEOUT',
  invalidResponse: 'INVALID_RESPONSE',
  unknown: 'UNKNOWN_ERROR',
  unauthenticated: 'UNAUTHENTICATED',
  notVerified: 'NOT_VERIFIED',
  forbidden: 'FORBIDDEN',
  notFound: 'NOT_FOUND',
  validation: 'VALIDATION_ERROR',
  emailTaken: 'EMAIL_TAKEN',
  codeMismatch: 'CODE_MISMATCH',
  codeExpired: 'CODE_EXPIRED',
  claimAlreadyApproved: 'CLAIM_ALREADY_APPROVED',
  merchantOnHold: 'MERCHANT_ON_HOLD',
  limitReached: 'LIMIT_REACHED',
  branchClosed: 'BRANCH_CLOSED',
} as const;
