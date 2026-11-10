'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query/keys';
import { fetchOrder, fetchOrders, placeOrder } from './api';

const ORDER_POLL_MS = 15_000;

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeOrder,
    meta: { inlineError: true },
    onSuccess: () => {
      toast.success('Order placed');
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
  });
}

export function useOrders() {
  return useQuery({ queryKey: queryKeys.orders.all(), queryFn: fetchOrders });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => fetchOrder(id),
    // Always ask again on opening. A cached status here could be hours behind.
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data && ['completed', 'cancelled'].includes(query.state.data.status)
        ? false
        : ORDER_POLL_MS,
    meta: { background: true },
  });
}
