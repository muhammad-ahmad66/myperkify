'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CLAIM_POLL_MS } from '@/lib/constants';
import { queryKeys } from '@/lib/query/keys';
import {
  approveClaim,
  deleteBranch,
  fetchBoard,
  fetchLedger,
  fetchMerchantDeal,
  fetchMerchantDeals,
  fetchMerchantOrders,
  fetchOverview,
  fetchStoreSettings,
  saveBranch,
  saveDeal,
  saveStoreProfile,
  submitSettlement,
  updateOrderStatus,
} from './api';

const keys = queryKeys.merchant;

/** New claims appear on their own (F-304). A real-time channel can replace polling after D-04. */
export function useCashierBoard() {
  return useQuery({
    queryKey: keys.board(),
    queryFn: fetchBoard,
    refetchInterval: CLAIM_POLL_MS,
    retry: false,
    meta: { background: true },
  });
}

export function useApproveClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveClaim,
    onSuccess: () => {
      toast.success('Approved. The student has their receipt.');
    },
    // Refresh either way: a failed approval usually means the code has just expired.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all() });
    },
  });
}

export function useOverview() {
  return useQuery({
    queryKey: keys.overview(),
    queryFn: fetchOverview,
    refetchInterval: CLAIM_POLL_MS * 3,
    meta: { background: true },
  });
}

export function useLedger() {
  return useQuery({ queryKey: keys.ledger(), queryFn: fetchLedger });
}

export function useSubmitSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitSettlement,
    onSuccess: () => {
      toast.success('Settlement sent. We will confirm it shortly.');
      void queryClient.invalidateQueries({ queryKey: keys.ledger() });
    },
  });
}

export function useMerchantOrders() {
  return useQuery({
    queryKey: keys.orders(),
    queryFn: fetchMerchantOrders,
    refetchInterval: CLAIM_POLL_MS * 3,
    meta: { background: true },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success('Order updated');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all() });
    },
  });
}

export function useMerchantDeals() {
  return useQuery({ queryKey: keys.deals(), queryFn: fetchMerchantDeals });
}

export function useMerchantDeal(id: string) {
  return useQuery({ queryKey: keys.deal(id), queryFn: () => fetchMerchantDeal(id) });
}

export function useSaveDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveDeal,
    meta: { inlineError: true },
    onSuccess: () => {
      toast.success('Deal saved');
      void queryClient.invalidateQueries({ queryKey: keys.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.deals.all() });
    },
  });
}

export function useStoreSettings() {
  return useQuery({ queryKey: keys.settings(), queryFn: fetchStoreSettings });
}

export function useSaveBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveBranch,
    onSuccess: (_data, { id }) => {
      toast.success(id ? 'Branch saved' : 'Branch added');
      void queryClient.invalidateQueries({ queryKey: keys.settings() });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      toast.success('Branch removed');
      void queryClient.invalidateQueries({ queryKey: keys.settings() });
    },
  });
}

export function useSaveStoreProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStoreProfile,
    onSuccess: () => {
      toast.success('Store profile saved');
      void queryClient.invalidateQueries({ queryKey: keys.settings() });
    },
  });
}
