'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { BrandTile } from '@/components/ui/BrandTile';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { receiptUrl } from '@/features/orders/urls';
import { formatPKR } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';
import { useClaim, useClaimPass, useCountdown } from '../../hooks';
import type { Claim } from '../../types';
import { VoucherTicket } from '../VoucherTicket';
import styles from './VoucherDialog.module.css';

type VoucherDialogProps = {
  claim: Claim | null;
  onClose: () => void;
};

function LiveView({ claim, reconnecting }: { claim: Claim; reconnecting: boolean }) {
  const secondsLeft = useCountdown(claim);
  const queryClient = useQueryClient();
  const { data: pass } = useClaimPass(claim.id, secondsLeft > 0);

  /* At 0:00 ask the server. It decides whether the code has really expired. */
  useEffect(() => {
    if (secondsLeft === 0) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.claims.detail(claim.id) });
    }
  }, [secondsLeft, claim.id, queryClient]);

  return (
    <>
      <VoucherTicket
        code={claim.code}
        pass={pass ?? null}
        amount={claim.amount}
        secondsLeft={secondsLeft}
        note="The QR changes every 30 seconds"
      />
      {reconnecting ? (
        <p className={styles.reconnecting} role="status">
          Connection lost. Your code still works. Reconnecting…
        </p>
      ) : (
        <p className={styles.waiting} role="status">
          Waiting for the cashier to approve
        </p>
      )}
    </>
  );
}

function RedeemedView({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  return (
    <div className={styles.done} role="status">
      <span className={styles.doneBadge}>
        <Icon icon={Check} size={34} strokeWidth={2.6} />
      </span>
      <h2>Paid &amp; redeemed</h2>
      <p>
        You saved {formatPKR(claim.saved)}. Your PDF receipt is on its way to {claim.receiptEmail}.
      </p>
      <dl className={styles.receipt}>
        <div>
          <dt>Transaction</dt>
          <dd>{claim.transactionId}</dd>
        </div>
        <div>
          <dt>Code</dt>
          <dd>{claim.code}</dd>
        </div>
      </dl>
      {claim.orderId && (
        <a className={styles.receiptLink} href={receiptUrl(claim.orderId)}>
          Download PDF receipt
        </a>
      )}
      <Button block className={styles.doneButton} onClick={onClose} autoFocus>
        Done
      </Button>
    </div>
  );
}

export function VoucherDialog({ claim, onClose }: VoucherDialogProps) {
  const { data, isRefetchError } = useClaim(claim);
  const current = data ?? claim;
  const status = current?.status;
  const queryClient = useQueryClient();
  const dealSlug = current?.dealSlug;

  useEffect(() => {
    if (status === 'expired') {
      toast('Code expired. Tap claim for a fresh one.');
      onClose();
    }
    if (status === 'redeemed' && dealSlug) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.deals.detail(dealSlug) });
    }
  }, [status, dealSlug, onClose, queryClient]);

  return (
    <Dialog open={claim !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={styles.sheet}>
        {current && (
          <>
            <div className={styles.head}>
              <BrandTile
                initials={current.brandInitials}
                color={current.brandColor}
                className={styles.tile}
              />
              <div>
                <DialogTitle className={styles.title}>
                  {current.brandName} · {current.branchName}
                </DialogTitle>
                <DialogDescription className={styles.subtitle}>
                  {current.optionLabel} · {formatPKR(current.amount)}
                </DialogDescription>
              </div>
              <DialogClose className={styles.close} aria-label="Close voucher">
                <Icon icon={X} />
              </DialogClose>
            </div>
            {current.status === 'redeemed' ? (
              <RedeemedView claim={current} onClose={onClose} />
            ) : (
              <LiveView claim={current} reconnecting={isRefetchError} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
