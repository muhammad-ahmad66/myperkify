'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query/keys';
import {
  decideMerchant,
  decideSettlement,
  decideVerification,
  fetchAdminMerchants,
  fetchAdminSettlements,
  fetchCounts,
  fetchVerifications,
} from './api';

const keys = queryKeys.admin;

export function useAdminCounts() {
  return useQuery({
    queryKey: keys.counts(),
    queryFn: fetchCounts,
    meta: { background: true },
  });
}

export function useVerificationQueue() {
  return useQuery({ queryKey: keys.verifications(), queryFn: fetchVerifications });
}

export function useAdminMerchants() {
  return useQuery({ queryKey: keys.merchants(), queryFn: fetchAdminMerchants });
}

export function useAdminSettlements() {
  return useQuery({ queryKey: keys.settlements(), queryFn: fetchAdminSettlements });
}

/** A decision another admin beat us to comes back as an error, so refresh either way. */
function useDecision<T>(mutationFn: (input: T) => Promise<void>, message: (input: T) => string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, input) => {
      toast.success(message(input));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all() });
    },
  });
}

export function useDecideVerification() {
  return useDecision(decideVerification, ({ decision }) =>
    decision === 'approve' ? 'Student approved' : 'Sent back for a new photo',
  );
}

export function useDecideMerchant() {
  return useDecision(decideMerchant, ({ decision }) =>
    decision === 'approve' ? 'Store approved' : 'Application rejected',
  );
}

export function useDecideSettlement() {
  return useDecision(decideSettlement, ({ decision }) =>
    decision === 'confirm' ? 'Settlement confirmed' : 'Settlement rejected',
  );
}
