'use client';

import clsx from 'clsx';
import { BadgeCheck, Clock, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { CLAIM_WINDOW_SECONDS } from '@/lib/constants';
import { formatClock, formatPKR, formatTimer } from '@/lib/format';
import { useApproveClaim, useCashierBoard } from '../../hooks';
import type { CompletedClaim, PendingClaim } from '../../types';
import styles from './CashierBoard.module.css';
import { QrScanner } from './QrScanner';

const LAST_MINUTE = 60;

function secondsLeft(claim: PendingClaim): number {
  return (new Date(claim.expiresAt).getTime() - new Date(claim.serverNow).getTime()) / 1000;
}

function useSecondsLeft(claim: PendingClaim): number {
  const [left, setLeft] = useState(() => secondsLeft(claim));

  useEffect(() => {
    const startedAt = Date.now();
    const total = secondsLeft(claim);
    const timer = setInterval(() => setLeft(total - (Date.now() - startedAt) / 1000), 1000);
    return () => clearInterval(timer);
  }, [claim]);

  return Math.max(0, left);
}

function ClaimCard({ claim }: { claim: PendingClaim }) {
  const approve = useApproveClaim();
  const left = useSecondsLeft(claim);
  const urgent = left < LAST_MINUTE;

  return (
    <article className={styles.claim}>
      <div className={styles.bar} aria-hidden="true">
        <i
          className={clsx(urgent && styles.urgent)}
          style={{ width: `${Math.min(100, (left / CLAIM_WINDOW_SECONDS) * 100)}%` }}
        />
      </div>

      <div className={styles.student}>
        <div>
          <strong>
            {claim.studentName}
            <Icon icon={BadgeCheck} size={18} className={styles.tick} />
            <span className={styles.verified}>Verified</span>
          </strong>
          <span>{claim.university}</span>
        </div>
        <span className={clsx(styles.timer, urgent && styles.timerUrgent)}>
          <Icon icon={Clock} size={14} />
          {formatTimer(left)}
        </span>
      </div>

      <div className={styles.match}>
        <div>
          <span>Code to match</span>
          <b className={styles.code}>{claim.code}</b>
        </div>
        <div className={styles.amount}>
          <span>Collect in cash</span>
          <b>{formatPKR(claim.amount)}</b>
        </div>
      </div>

      <p className={styles.item}>
        {claim.item} · {claim.branchName}
      </p>

      <Button
        size="lg"
        block
        className={styles.approve}
        loading={approve.isPending}
        onClick={() => approve.mutate(claim.id)}
      >
        {approve.isPending ? 'Approving…' : 'Approve & mark paid'}
      </Button>
    </article>
  );
}

function CompletedRow({ claim }: { claim: CompletedClaim }) {
  return (
    <li>
      <div>
        <strong>{claim.studentName}</strong>
        <span>
          {claim.university} · {formatClock(claim.approvedAt)}
        </span>
      </div>
      <b>{formatPKR(claim.amount)}</b>
    </li>
  );
}

function Live() {
  return (
    <span className={styles.live}>
      <i />
      Live
    </span>
  );
}

/** The most important merchant page. It is used at a busy counter, so it refreshes itself. */
export function CashierBoard() {
  const query = useCashierBoard();

  return (
    <>
      <PageHeader
        title="Claims"
        actions={
          <div className={styles.headActions}>
            <Live />
            <QrScanner />
          </div>
        }
      />
      <QueryState query={query} label="claims">
        {({ pending, completedToday }) => {
          const total = completedToday.reduce((sum, claim) => sum + claim.amount, 0);
          return (
            <div className={styles.columns}>
              <section aria-label="Waiting for approval" aria-live="polite">
                {pending.length === 0 ? (
                  <div className={styles.empty}>
                    <span className={styles.emptyIcon}>
                      <Icon icon={Ticket} size={28} />
                    </span>
                    <strong>No claims waiting</strong>
                    <p>New claims appear here by themselves.</p>
                  </div>
                ) : (
                  <div className={styles.list}>
                    {pending.map((claim) => (
                      <ClaimCard key={claim.id} claim={claim} />
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.today} aria-labelledby="completed-today">
                <header>
                  <h2 id="completed-today">Completed today</h2>
                  {completedToday.length > 0 && <b>{formatPKR(total)}</b>}
                </header>
                {completedToday.length === 0 ? (
                  <p className={styles.none}>Approved claims show here.</p>
                ) : (
                  <ul>
                    {completedToday.map((claim) => (
                      <CompletedRow key={claim.id} claim={claim} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          );
        }}
      </QueryState>
    </>
  );
}
