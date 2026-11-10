'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query/keys';
import { ROUTES } from '@/lib/routes';
import { deleteAccount, fetchAccountSummary, fetchSavedDeals, updateName } from './api';

export function useAccountSummary() {
  return useQuery({ queryKey: queryKeys.account.summary(), queryFn: fetchAccountSummary });
}

export function useSavedDeals() {
  return useQuery({ queryKey: queryKeys.account.saved(), queryFn: fetchSavedDeals });
}

export function useUpdateName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateName,
    onSuccess: (viewer) => {
      queryClient.setQueryData(queryKeys.session.viewer(), viewer);
      toast.success('Name updated');
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      window.location.assign(ROUTES.home);
    },
  });
}
