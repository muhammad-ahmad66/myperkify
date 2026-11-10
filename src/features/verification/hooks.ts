'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Viewer } from '@/features/session/types';
import { queryKeys } from '@/lib/query/keys';
import { createAccount, fetchUniversities, resendCode, uploadCard, verifyCode } from './api';
import type { AccountValues } from './types';

export function useUniversities() {
  return useQuery({
    queryKey: queryKeys.verification.universities(),
    queryFn: fetchUniversities,
    staleTime: Infinity,
    meta: { background: true },
  });
}

/**
 * Sign-up mutations show their errors next to the form. Changing verification status can change
 * prices, so every deal query is refreshed.
 */
function useViewerMutation<TInput>(
  mutationFn: (input: TInput) => Promise<Viewer>,
  successMessage: (input: TInput) => string | null,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { inlineError: true },
    onSuccess: async (viewer, input) => {
      queryClient.setQueryData(queryKeys.session.viewer(), viewer);
      const message = successMessage(input);
      if (message) toast.success(message);
      await queryClient.invalidateQueries({ queryKey: queryKeys.deals.all() });
    },
  });
}

export function useCreateAccount() {
  return useViewerMutation(createAccount, (values: AccountValues) =>
    values.method === 'email' ? `Code sent to ${values.email}` : null,
  );
}

export function useVerifyCode() {
  return useViewerMutation(verifyCode, () => null);
}

/** Tracks upload progress, so a slow connection on a phone never looks stuck. */
export function useUploadCard() {
  const [progress, setProgress] = useState(0);
  const mutation = useViewerMutation(
    (file: File) => uploadCard(file, setProgress),
    () => "Card sent. We'll email you when it's checked.",
  );
  return { ...mutation, progress };
}

export function useResendCode() {
  return useMutation({
    mutationFn: resendCode,
    onSuccess: () => {
      toast.success('New code sent');
    },
  });
}

/** Counts down from a start value. Calling restart begins again. */
export function useResendTimer(seconds: number) {
  const [left, setLeft] = useState(seconds);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLeft((value) => {
        if (value <= 1) clearInterval(timer);
        return Math.max(0, value - 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [round]);

  return {
    left,
    restart: () => {
      setLeft(seconds);
      setRound((value) => value + 1);
    },
  };
}
