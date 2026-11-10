import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, isRetryable, toApiError } from './errors';

function axiosFailure(status: number, data: unknown) {
  const error = new AxiosError('Request failed');
  error.response = { status, data } as AxiosResponse;
  return error;
}

describe('toApiError', () => {
  it('reads the code, message and fields from an API failure', () => {
    const result = toApiError(
      axiosFailure(409, {
        error: { code: 'EMAIL_TAKEN', message: 'Taken.', fields: { email: 'Taken.' } },
      }),
    );
    expect(result.code).toBe('EMAIL_TAKEN');
    expect(result.status).toBe(409);
    expect(result.fields).toEqual({ email: 'Taken.' });
  });

  it('never exposes raw server text', () => {
    const result = toApiError(axiosFailure(500, '<html>stack trace at db.ts:12</html>'));
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).not.toContain('stack trace');
  });

  it('falls back to a friendly message for the status', () => {
    expect(toApiError(axiosFailure(429, 'slow down')).message).toMatch(/Too many tries/);
  });

  it('reports a missing response as offline', () => {
    expect(toApiError(new AxiosError('Network Error')).code).toBe('NETWORK_ERROR');
  });

  it('reports a timeout separately', () => {
    expect(toApiError(new AxiosError('timeout', 'ECONNABORTED')).code).toBe('TIMEOUT');
  });

  it('treats a malformed response as invalid without showing its details', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const parsed = z.object({ id: z.string() }).safeParse({ id: 1 });
    const result = toApiError(parsed.error);
    expect(result.code).toBe('INVALID_RESPONSE');
    expect(result.message).toMatch(/^Something went wrong/);
    logged.mockRestore();
  });

  it('passes an ApiError through unchanged', () => {
    const original = new ApiError({ code: 'X', message: 'Y' });
    expect(toApiError(original)).toBe(original);
  });
});

describe('isRetryable', () => {
  it('retries network failures and server faults', () => {
    expect(isRetryable(new ApiError({ code: 'NETWORK_ERROR', message: '' }))).toBe(true);
    expect(isRetryable(new ApiError({ code: 'UNKNOWN_ERROR', message: '', status: 503 }))).toBe(
      true,
    );
  });

  it('does not retry a rejected request', () => {
    expect(isRetryable(new ApiError({ code: 'LIMIT_REACHED', message: '', status: 409 }))).toBe(
      false,
    );
  });
});
