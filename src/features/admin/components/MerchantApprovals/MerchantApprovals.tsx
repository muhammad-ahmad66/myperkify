'use client';

import { BrandTile } from '@/components/ui/BrandTile';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import { Table } from '@/components/ui/Table';
import { formatPKR } from '@/lib/format';
import { useAdminMerchants, useDecideMerchant } from '../../hooks';
import type { AdminMerchant } from '../../types';
import styles from './MerchantApprovals.module.css';

const STATUS: Record<AdminMerchant['status'], [BadgeTone, string]> = {
  applied: ['waiting', 'Applied'],
  active: ['success', 'Active'],
  on_hold: ['danger', 'On hold'],
  suspended: ['danger', 'Suspended'],
  rejected: ['neutral', 'Rejected'],
};

function Application({ merchant }: { merchant: AdminMerchant }) {
  const decide = useDecideMerchant();

  return (
    <article className={styles.application}>
      <div className={styles.head}>
        <BrandTile initials={merchant.initials} color={merchant.color} />
        <strong>{merchant.name}</strong>
      </div>
      {merchant.description && <p>{merchant.description}</p>}
      <p className={styles.meta}>
        {merchant.ownerName} · {merchant.ownerEmail} · {merchant.phone} · {merchant.branchesNote}
      </p>
      <div className={styles.actions}>
        <Button
          loading={decide.isPending}
          onClick={() => decide.mutate({ id: merchant.id, decision: 'approve' })}
        >
          Approve store
        </Button>
        <Button
          variant="ghost"
          disabled={decide.isPending}
          onClick={() =>
            decide.mutate({
              id: merchant.id,
              decision: 'reject',
              reason: "We can't list this business right now.",
            })
          }
        >
          Reject
        </Button>
      </div>
    </article>
  );
}

export function MerchantApprovals() {
  const query = useAdminMerchants();

  return (
    <>
      <PageHeader title="Merchants" />
      <QueryState query={query} label="merchants">
        {(merchants) => {
          const applied = merchants.filter((merchant) => merchant.status === 'applied');
          const rest = merchants.filter((merchant) => merchant.status !== 'applied');
          return (
            <div className={styles.stack}>
              {applied.map((merchant) => (
                <Application key={merchant.id} merchant={merchant} />
              ))}
              <Table label="All merchants">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Owner</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((merchant) => {
                    const [tone, label] = STATUS[merchant.status];
                    return (
                      <tr key={merchant.id}>
                        <td>
                          <span className={styles.store}>
                            <BrandTile
                              initials={merchant.initials}
                              color={merchant.color}
                              size="sm"
                            />
                            {merchant.name}
                          </span>
                        </td>
                        <td>{merchant.ownerName}</td>
                        <td>{formatPKR(merchant.balance)}</td>
                        <td>
                          <StatusBadge tone={tone}>{label}</StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          );
        }}
      </QueryState>
    </>
  );
}
