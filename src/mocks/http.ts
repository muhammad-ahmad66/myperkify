import type { z } from 'zod';
import { API_ERROR_CODES } from '@/lib/api/types';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, status = 200, meta?: { total: number }): Response {
  return Response.json({ data, meta }, { status });
}

export function failure(error: HttpError): Response {
  return Response.json(
    { error: { code: error.code, message: error.message, fields: error.fields } },
    { status: error.status },
  );
}

/** Reads and checks a JSON body. A malformed request gets a 422, never a crash. */
export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  const body: unknown = await request.json().catch(() => undefined);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw invalid('That request was not valid. Refresh and try again.');
  return parsed.data;
}

export function notFound(message = "We couldn't find that."): HttpError {
  return new HttpError(404, API_ERROR_CODES.notFound, message);
}

export function invalid(message: string, fields?: Record<string, string>): HttpError {
  return new HttpError(422, API_ERROR_CODES.validation, message, fields);
}
