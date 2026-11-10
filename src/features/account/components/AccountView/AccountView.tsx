'use client';

import clsx from 'clsx';
import { format } from 'date-fns';
import { Download, Ticket, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { BrandTile } from '@/components/ui/BrandTile';
import { TextField } from '@/components/ui/form';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Wrap } from '@/components/ui/Wrap';
import { useSignOut } from '@/features/auth/hooks';
import { DealCard } from '@/features/deals/components/DealCard';
import { useOrders } from '@/features/orders/hooks';
import { ORDER_STATUS } from '@/features/orders/labels';
import { receiptUrl } from '@/features/orders/urls';
import type { Order } from '@/features/orders/types';
import { useViewer } from '@/features/session/hooks';
import { IdentityCard } from '@/features/verification/components/IdentityCard';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { useAccountSummary, useDeleteAccount, useSavedDeals, useUpdateName } from '../../hooks';
import styles from './AccountView.module.css';

const MIN_NAME = 2;

function Summary() {
  const query = useAccountSummary();
  const { viewer } = useViewer();
  const student = viewer.kind === 'student' ? viewer : null;

  return (
    <QueryState query={query} label="your summary">
      {(summary) => (
        <>
          <div className={styles.top}>
            {student && <IdentityCard student={student} />}
            <div className={styles.saved}>
              <span>Total saved</span>
              <b>{formatPKR(summary.totalSaved)}</b>
              <small>
                {summary.completedOrders} order{summary.completedOrders === 1 ? '' : 's'} and claims
                · {summary.savedDeals} saved
              </small>
            </div>
          </div>
          <section
            id="my-pass"
            className={clsx(styles.pass, summary.liveClaim && styles.passLive)}
            aria-labelledby="my-pass-title"
          >
            <span className={styles.passIcon}>
              <Icon icon={Ticket} size={20} />
            </span>
            <div>
              <h2 id="my-pass-title">My pass</h2>
              <p>
                {summary.liveClaim
                  ? `You have a live code for ${summary.liveClaim.brand}.`
                  : 'No live code right now.'}
              </p>
            </div>
            <ButtonLink
              href={summary.liveClaim ? ROUTES.deal(summary.liveClaim.dealSlug) : ROUTES.deals}
              variant={summary.liveClaim ? 'inverse' : 'primary'}
            >
              {summary.liveClaim ? 'Show my code' : 'Browse deals'}
            </ButtonLink>
          </section>
        </>
      )}
    </QueryState>
  );
}

function OrderRow({ order }: { order: Order }) {
  const [tone, label] = ORDER_STATUS[order.status];
  const status = order.source === 'in_store' && order.status === 'completed' ? 'Redeemed' : label;

  return (
    <li className={styles.order}>
      <BrandTile initials={order.merchantInitials} color={order.merchantColor} />
      <Link className={styles.orderMain} href={ROUTES.accountOrder(order.id)}>
        <b>{order.merchantName}</b>
        <small>
          {order.number} · {format(new Date(order.createdAt), 'd MMM yyyy')}
        </small>
      </Link>
      <span className={styles.orderStatus}>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </span>
      <b className={styles.orderTotal}>{formatPKR(order.total)}</b>
      {order.hasReceipt ? (
        <a
          className={styles.receipt}
          href={receiptUrl(order.id)}
          aria-label={`Download receipt for ${order.number}`}
        >
          <Icon icon={Download} size={17} />
        </a>
      ) : (
        <span className={styles.receiptGap} />
      )}
    </li>
  );
}

function OrdersSection() {
  const query = useOrders();
  return (
    <section id="orders" className={styles.section} aria-labelledby="orders-title">
      <h2 id="orders-title">Orders and receipts</h2>
      <QueryState
        query={query}
        label="your orders"
        isEmpty={(orders) => orders.length === 0}
        empty="Your orders and receipts will appear here."
      >
        {(orders) => (
          <ul className={styles.orders}>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ul>
        )}
      </QueryState>
    </section>
  );
}

function SavedSection() {
  const query = useSavedDeals();
  return (
    <section id="saved" className={styles.section} aria-labelledby="saved-title">
      <h2 id="saved-title">Saved deals</h2>
      <QueryState
        query={query}
        label="your saved deals"
        isEmpty={(deals) => deals.length === 0}
        empty="Tap the heart on a deal to keep it here."
      >
        {(deals) => (
          <div className={styles.grid}>
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </QueryState>
    </section>
  );
}

function ProfileSection() {
  const { viewer } = useViewer();
  const student = viewer.kind === 'student' ? viewer : null;
  const [name, setName] = useState(student?.name ?? '');
  const [confirming, setConfirming] = useState(false);
  const update = useUpdateName();
  const signOut = useSignOut();
  const remove = useDeleteAccount();
  const nameError = name.trim().length < MIN_NAME ? 'Enter your full name.' : undefined;
  if (!student) return null;

  const verified = student.verification.status === 'verified';

  return (
    <section className={styles.section} aria-labelledby="profile-title">
      <h2 id="profile-title">Profile</h2>
      <div className={styles.profile}>
        <form
          className={styles.nameForm}
          onSubmit={(event) => {
            event.preventDefault();
            if (!nameError) update.mutate(name.trim());
          }}
          noValidate
        >
          <TextField
            label="Full name"
            placeholder="Ayesha Khan"
            icon={User}
            error={nameError}
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button type="submit" variant="ghost" size="lg" loading={update.isPending}>
            Save name
          </Button>
        </form>
        <p className={styles.email}>{student.email}</p>
        {!verified && (
          <Link className={styles.link} href={ROUTES.getVerified}>
            Finish verifying
          </Link>
        )}
        <div className={styles.actions}>
          <Button variant="ghost" loading={signOut.isPending} onClick={() => signOut.mutate()}>
            Sign out
          </Button>
          <button type="button" className={styles.delete} onClick={() => setConfirming(true)}>
            Delete account
          </button>
        </div>
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className={styles.confirm}>
          <DialogTitle className={styles.confirmTitle}>Delete your account?</DialogTitle>
          <DialogDescription className={styles.confirmText}>
            You&apos;ll lose your verified status and saved deals. This can&apos;t be undone.
          </DialogDescription>
          <div className={styles.actions}>
            <Button loading={remove.isPending} onClick={() => remove.mutate()}>
              Delete my account
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Keep my account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function AccountView() {
  return (
    <main className={styles.page}>
      <Wrap>
        <PageHeader title="Your account" />
        <Summary />
        <OrdersSection />
        <SavedSection />
        <ProfileSection />
      </Wrap>
    </main>
  );
}
