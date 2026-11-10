import 'server-only';
import { cookies, headers } from 'next/headers';
import { API_BASE_URL, USES_MOCK_API } from './config';
import { ApiError, isApiFailure } from './errors';
import { API_ERROR_CODES, type ApiSuccess } from './types';

/**
 * Data fetching for Server Components, so public pages render real HTML. Forwards the viewer's
 * cookies, which is how the API decides whether a response may contain student prices.
 */
/**
 * On a host with several server instances, such as Vercel, a page and the mock API may not share
 * memory. Pages there ask the mock API over the network, so there is one copy of the data.
 */
const MOCK_OVER_NETWORK = process.env.VERCEL === '1';

async function ownOrigin(): Promise<string> {
  const incoming = await headers();
  const host = incoming.get('x-forwarded-host') ?? incoming.get('host');
  const protocol = incoming.get('x-forwarded-proto') ?? 'https';
  return `${protocol}://${host}`;
}

export async function serverGetWithMeta<T>(path: string): Promise<ApiSuccess<T>> {
  const cookieHeader = (await cookies()).toString();

  let response: Response;
  if (USES_MOCK_API && MOCK_OVER_NETWORK) {
    const { SERVER_RENDER_HEADER } = await import('@/mocks/network');
    response = await fetch(`${await ownOrigin()}${API_BASE_URL}${path}`, {
      headers: { cookie: cookieHeader, [SERVER_RENDER_HEADER]: '1' },
      cache: 'no-store',
    });
  } else if (USES_MOCK_API) {
    const request = new Request(`http://mock.local${API_BASE_URL}${path}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    const { handleMockRequest } = await import('@/mocks/handlers');
    response = await handleMockRequest(request);
  } else {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
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
