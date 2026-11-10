'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query/keys';
import { addToCart, fetchCart, removeCartLine, updateCartLine } from './api';
import type { AddToCartInput, CartSummary } from './types';

export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart.summary(),
    queryFn: fetchCart,
    meta: { background: true },
  });
}

/** Not retryable from the toast: a request that timed out may still have added the item. */
export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddToCartInput & { successMessage: string }) => addToCart(input),
    onSuccess: (cart, { successMessage }) => {
      queryClient.setQueryData(queryKeys.cart.summary(), cart);
      toast.success(successMessage);
    },
    // Not returned: an awaited refetch would keep the button spinning after the failure.
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary() });
    },
  });
}

/** Every change returns the whole cart, so totals always come from the server. */
function useCartMutation<TInput>(mutationFn: (input: TInput) => Promise<CartSummary>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.summary(), cart);
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary() });
    },
  });
}

export function useUpdateCartLine() {
  return useCartMutation(updateCartLine);
}

export function useRemoveCartLine() {
  return useCartMutation(removeCartLine);
}
