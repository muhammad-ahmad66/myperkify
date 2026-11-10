import 'server-only';
import { cookies } from 'next/headers';
import { API_BASE_URL, USES_MOCK_API } from './config';
import { ApiError, isApiFailure } from './errors';
import { API_ERROR_CODES, type ApiSuccess } from './types';

/**
 * Data fetching for Server Components, so public pages render real HTML. Forwards the viewer's
 * cookies, which is how the API decides whether a response may contain student prices.
 */
export async function serverGetWithMeta<T>(path: string): Promise<ApiSuccess<T>> {
  const cookieHeader = (await cookies()).toString();
  const origin = USES_MOCK_API ? 'http://mock.local' : '';
  const request = new Request(`${origin}${API_BASE_URL}${path}`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });

  let response: Response;
  if (USES_MOCK_API) {
    const { handleMockRequest } = await import('@/mocks/handlers');
    response = await handleMockRequest(request);
  } else {
    response = await fetch(request);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiFailure(body)) throw new ApiError({ ...body.error, status: response.status });
    throw new ApiError({
      code: API_ERROR_CODES.unknown,
      message: 'Something went wrong on our side. Try again in a moment.',
      status: response.status,
    });
  }
  return body as ApiSuccess<T>;
}

export async function serverGet<T>(path: string): Promise<T> {
  return (await serverGetWithMeta<T>(path)).data;
}
