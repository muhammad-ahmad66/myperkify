import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isRetryable, toApiError } from '@/lib/api/errors';
import { API_ERROR_CODES } from '@/lib/api/types';
import { ROUTES } from '@/lib/routes';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      /** Polling and small lookups: no progress bar and no failure toast. */
      background?: boolean;
    };
    mutationMeta: {
      /** Set when the caller shows the error inline, so no toast appears. */
      inlineError?: boolean;
      /** Offers "Try again" on the toast. Only for requests that are safe to repeat. */
      retryable?: boolean;
    };
  }
}

const MAX_QUERY_RETRIES = 2;

/** 401 goes to sign in. 403 NOT_VERIFIED goes to verification. */
function redirectForAuth(code: string, message: string): boolean {
  const target =
    code === API_ERROR_CODES.unauthenticated
      ? ROUTES.signIn
      : code === API_ERROR_CODES.notVerified
        ? ROUTES.getVerified
        : null;
  if (!target) return false;
  if (typeof window !== 'undefined' && window.location.pathname !== target) {
    toast(message);
    window.location.assign(target);
  }
  return true;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Fail straight away when offline, so screens show their error state and a way to retry.
        networkMode: 'always',
        retry: (failureCount, error) =>
          isRetryable(toApiError(error)) && failureCount < MAX_QUERY_RETRIES,
      },
      mutations: { networkMode: 'always' },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        const apiError = toApiError(error);
        if (redirectForAuth(apiError.code, apiError.message)) return;
        // A first load shows its own error state. A failed refresh keeps the old data on screen,
        // so the toast is the only sign that it may be out of date.
        if (query.state.data !== undefined && !query.meta?.background) {
          toast.error(apiError.message, { id: apiError.code });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, _context, mutation) => {
        const apiError = toApiError(error);
        if (redirectForAuth(apiError.code, apiError.message)) return;
        if (mutation.meta?.inlineError) return;

        const canRetry = mutation.meta?.retryable && isRetryable(apiError);
        toast.error(apiError.message, {
          action: canRetry
            ? { label: 'Try again', onClick: () => void mutation.execute(variables) }
            : undefined,
        });
      },
    }),
  });
}
