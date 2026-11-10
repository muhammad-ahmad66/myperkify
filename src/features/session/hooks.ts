'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { fetchViewer } from './api';
import { isVerified, type Viewer } from './types';

/** The root layout seeds this from the server, so it never starts empty. */
export function useViewer(options?: { refetchInterval?: number | false }) {
  const query = useQuery<Viewer>({
    queryKey: queryKeys.session.viewer(),
    queryFn: fetchViewer,
    refetchInterval: options?.refetchInterval,
    meta: { background: true },
  });
  const viewer: Viewer = query.data ?? { kind: 'visitor' };
  return { viewer, isVerified: isVerified(viewer) };
}
