'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import type { Viewer } from '@/features/session/types';
import { makeQueryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';

export function AppProviders({ viewer, children }: { viewer: Viewer; children: ReactNode }) {
  const [queryClient] = useState(() => {
    const client = makeQueryClient();
    client.setQueryData(queryKeys.session.viewer(), viewer);
    return client;
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
