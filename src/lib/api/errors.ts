import { isAxiosError } from 'axios';
import { ZodError } from 'zod';
import { API_ERROR_CODES, type ApiFailure } from './types';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number | undefined;
  readonly fields: Record<string, string> | undefined;

  constructor(options: {
    code: string;
    message: string;
    status?: number;
    fields?: Record<string, string>;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.code = options.code;
    this.status = options.status;
    this.fields = options.fields;
  }
}

const OFFLINE_MESSAGE = "You're offline. Check your connection and try again.";
const TIMEOUT_MESSAGE = 'That took too long. Check your connection and try again.';
const UNKNOWN_MESSAGE = 'Something went wrong on our side. Try again in a moment.';

/** Used when a response has no safe message of its own. */
const STATUS_MESSAGES: Record<number, string> = {
  401: 'Your session has ended. Sign in to continue.',
  403: "You don't have access to that.",
  404: "We couldn't find that. It may have moved or ended.",
  413: 'That file is too large.',
  429: 'Too many tries. Wait a minute and try again.',
  503: 'MyPerkify is busy right now. Try again in a moment.',
};

export function isApiFailure(value: unknown): value is ApiFailure {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const { error } = value;
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

/** Turns anything thrown by a request into a typed ApiError. Raw server text never reaches the UI. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    console.error('API response failed validation', error.issues);
    return new ApiError({ code: API_ERROR_CODES.invalidResponse, message: UNKNOWN_MESSAGE });
  }

  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({ code: API_ERROR_CODES.timeout, message: TIMEOUT_MESSAGE });
    }
    if (!error.response) {
      return new ApiError({ code: API_ERROR_CODES.network, message: OFFLINE_MESSAGE });
    }
    const { status, data } = error.response;
    if (isApiFailure(data)) {
      return new ApiError({ ...data.error, status });
    }
    return new ApiError({
      code: API_ERROR_CODES.unknown,
      message: STATUS_MESSAGES[status] ?? UNKNOWN_MESSAGE,
      status,
    });
  }

  return new ApiError({ code: API_ERROR_CODES.unknown, message: UNKNOWN_MESSAGE });
}

/** Failures where trying again can help. A rejected request would only fail the same way. */
export function isRetryable(error: ApiError): boolean {
  if (error.code === API_ERROR_CODES.network || error.code === API_ERROR_CODES.timeout) return true;
  return error.status !== undefined && error.status >= 500;
}
