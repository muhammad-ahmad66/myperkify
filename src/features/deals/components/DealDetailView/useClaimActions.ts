'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAddToCart } from '@/features/cart/hooks';
import { useCreateClaim, useLiveClaim } from '@/features/claims/hooks';
import { queryKeys } from '@/lib/query/keys';
import type { DealDetail } from '../../types';
import type { ClaimSelection } from './useClaimSelection';

/**
 * Starting a claim, showing the voucher, and adding to cart.
 *
 * The voucher is whatever claim the server says is live, so a reload shows the same code with
 * the time left (F-302). Closing it only hides it. The claim keeps running until it expires.
 */
export function useClaimActions(deal: DealDetail, selection: ClaimSelection, verified: boolean) {
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createClaim = useCreateClaim();
  const addToCart = useAddToCart();
  const { data: liveClaim } = useLiveClaim(deal.slug, verified);
  const { branch, option, quantity } = selection;

  const voucher = liveClaim && liveClaim.id !== dismissedId ? liveClaim : null;

  function closeVoucher() {
    setDismissedId(liveClaim?.id ?? null);
    void queryClient.invalidateQueries({ queryKey: queryKeys.claims.live(deal.slug) });
  }

  function claimInStore() {
    if (liveClaim) {
      setDismissedId(null);
      return;
    }
    if (!branch || !option) return;
    if (!branch.isOpen) {
      toast.error(`${branch.name} is closed right now. Pick another branch.`);
      return;
    }
    createClaim.mutate({ dealId: deal.id, optionId: option.id, branchId: branch.id });
  }

  function addOptionToCart() {
    if (!option) return;
    addToCart.mutate({
      dealId: deal.id,
      optionId: option.id,
      quantity,
      successMessage: `${quantity} × ${option.label} added to your cart`,
    });
  }

  return {
    voucher,
    closeVoucher,
    hasLiveClaim: Boolean(liveClaim),
    claimInStore,
    isClaiming: createClaim.isPending,
    addOptionToCart,
    isAddingToCart: addToCart.isPending,
  };
}

export type ClaimActions = ReturnType<typeof useClaimActions>;
