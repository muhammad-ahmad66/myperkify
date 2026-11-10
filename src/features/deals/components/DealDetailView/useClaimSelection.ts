'use client';

import { useState } from 'react';
import type { DealDetail } from '../../types';

export type ClaimMode = 'store' | 'online';

/** What the student has picked on the deal page. Shared by the panel, branches and bottom bar. */
export function useClaimSelection(deal: DealDetail) {
  const [mode, setMode] = useState<ClaimMode>(deal.mode === 'online' ? 'online' : 'store');
  const [optionId, setOptionId] = useState(deal.options[0]?.id ?? '');
  const [branchId, setBranchId] = useState(deal.branches[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);

  const option = deal.options.find((entry) => entry.id === optionId) ?? deal.options[0];
  const branch = deal.branches.find((entry) => entry.id === branchId) ?? deal.branches[0];

  return { mode, setMode, option, setOptionId, branch, setBranchId, quantity, setQuantity };
}

export type ClaimSelection = ReturnType<typeof useClaimSelection>;
