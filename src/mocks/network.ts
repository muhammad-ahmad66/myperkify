import { delay } from 'msw';
import { API_ERROR_CODES } from '@/lib/api/types';
import { getDb } from './db';
import { handleMockRequest } from './handlers';
import { failure, HttpError } from './http';

/** Marks a page's own request, which skips the simulated latency and outages. */
export const SERVER_RENDER_HEADER = 'x-mock-server-render';

const NORMAL_LATENCY_MS = { min: 200, max: 600 };
const SLOW_LATENCY_MS = 3000;

function latency(): number {
  const { min, max } = NORMAL_LATENCY_MS;
  return getDb().network === 'slow' ? SLOW_LATENCY_MS : min + Math.random() * (max - min);
}

/**
 * What a browser request goes through, so loading states are real and failures can be tried.
 * Server rendering calls handleMockRequest directly and skips this: pages stay fast, and a
 * simulated outage shows up in the UI rather than taking down the whole page.
 */
export async function serveMockRequest(request: Request): Promise<Response> {
  const isDevTool = new URL(request.url).pathname.includes('/dev/');
  const isServerRender = request.headers.get(SERVER_RENDER_HEADER) === '1';
  if (isDevTool || isServerRender) return handleMockRequest(request);

  await delay(latency());
  if (getDb().network === 'failing') {
    return failure(
      new HttpError(
        503,
        API_ERROR_CODES.unknown,
        'MyPerkify is busy right now. Try again in a moment.',
      ),
    );
  }
  return handleMockRequest(request);
}
