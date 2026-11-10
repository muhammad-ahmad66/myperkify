'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { ROUTES } from '@/lib/routes';
import { confirmSignIn, requestSignIn, signOut } from './api';

export function useRequestSignIn() {
  return useMutation({ mutationFn: requestSignIn, meta: { inlineError: true } });
}

export function useConfirmSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmSignIn,
    meta: { inlineError: true },
    onSuccess: (viewer) => {
      queryClient.setQueryData(queryKeys.session.viewer(), viewer);
      void queryClient.invalidateQueries({ queryKey: queryKeys.deals.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary() });
    },
  });
}

/** A full page load, so nothing from the last session stays in memory. */
export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      window.location.assign(ROUTES.home);
    },
  });
}
