'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { CLAIM_POLL_MS } from '@/lib/constants';
import { queryKeys } from '@/lib/query/keys';
import { cancelClaim, createClaim, fetchClaim, fetchLiveClaim } from './api';
import type { Claim } from './types';

/**
 * Polls while the claim is pending and stops on any terminal status. A failed poll is not
 * retried here, because the next poll is the retry. A real-time channel can replace this once
 * D-04 and D-16 are decided, with polling kept as the fallback.
 */
export function useClaim(initial: Claim | null) {
  const id = initial?.id ?? '';
  return useQuery({
    queryKey: queryKeys.claims.detail(id),
    queryFn: () => fetchClaim(id),
    enabled: id !== '',
    initialData: initial ?? undefined,
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? CLAIM_POLL_MS : false),
    meta: { background: true },
  });
}

/** Reopening a deal shows the same live voucher (F-302). */
export function useLiveClaim(dealSlug: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.claims.live(dealSlug),
    queryFn: () => fetchLiveClaim(dealSlug),
    enabled,
    staleTime: 0,
    meta: { background: true },
  });
}

/** Safe to retry: the server returns the same live claim for a repeat request. */
export function useCreateClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClaim,
    meta: { retryable: true },
    onSuccess: async (claim) => {
      // A check started before this claim would answer "no live code" and close the voucher.
      await queryClient.cancelQueries({ queryKey: queryKeys.claims.live(claim.dealSlug) });
      queryClient.setQueryData(queryKeys.claims.detail(claim.id), claim);
      queryClient.setQueryData(queryKeys.claims.live(claim.dealSlug), claim);
    },
    // A refused claim often means the deal changed, such as a branch closing or a limit reached.
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.deals.all() });
    },
  });
}

export function useCancelClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelClaim,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['claims', 'live'] }),
  });
}

function secondsUntilExpiry(claim: Claim): number {
  return (new Date(claim.expiresAt).getTime() - new Date(claim.serverNow).getTime()) / 1000;
}

/**
 * Seconds left, counted from the gap the server reported rather than the phone's own clock.
 * Every poll brings a fresh claim, so the display corrects itself.
 */
export function useCountdown(claim: Claim): number {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntilExpiry(claim));

  useEffect(() => {
    const startedAt = Date.now();
    const total = secondsUntilExpiry(claim);
    const timer = setInterval(() => {
      setSecondsLeft(total - (Date.now() - startedAt) / 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, [claim]);

  return Math.max(0, Math.ceil(secondsLeft));
}
