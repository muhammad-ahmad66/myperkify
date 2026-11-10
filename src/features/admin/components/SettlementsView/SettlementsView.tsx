'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import { Table } from '@/components/ui/Table';
import { formatPKR } from '@/lib/format';
import { useAdminSettlements, useDecideSettlement } from '../../hooks';
import type { AdminSettlements } from '../../types';
import styles from './SettlementsView.module.css';

type Settlement = AdminSettlements['settlements'][number];

const STATUS: Record<Settlement['status'], [BadgeTone, string]> = {
  submitted: ['waiting', 'To confirm'],
  confirmed: ['success', 'Confirmed'],
  rejected: ['danger', 'Rejected'],
};

function SettlementRow({ settlement }: { settlement: Settlement }) {
  const decide = useDecideSettlement();
  const [tone, label] = STATUS[settlement.status];

  return (
    <tr>
      <td>{format(new Date(settlement.createdAt), 'd MMM yyyy')}</td>
      <td>{settlement.merchantName}</td>
      <td>{settlement.reference}</td>
      <td>{formatPKR(settlement.amount)}</td>
      <td>
        {settlement.status === 'submitted' ? (
          <div className={styles.actions}>
            <Button
              size="sm"
              loading={decide.isPending}
              onClick={() => decide.mutate({ id: settlement.id, decision: 'confirm' })}
            >
              Confirm
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={decide.isPending}
              onClick={() => decide.mutate({ id: settlement.id, decision: 'reject' })}
            >
              Reject
            </Button>
          </div>
        ) : (
          <StatusBadge tone={tone}>{label}</StatusBadge>
        )}
      </td>
    </tr>
  );
}

export function SettlementsView() {
  const query = useAdminSettlements();

  return (
    <>
      <PageHeader title="Settlements" />
      <QueryState query={query} label="settlements">
        {({ settlements, balances, threshold }) => (
          <div className={styles.stack}>
            <section>
              <h2>Submitted</h2>
              {settlements.length === 0 ? (
                <p className={styles.none}>No settlements yet.</p>
              ) : (
                <Table label="Submitted settlements">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Store</th>
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((settlement) => (
                      <SettlementRow key={settlement.id} settlement={settlement} />
                    ))}
                  </tbody>
                </Table>
              )}
            </section>
            <section>
              <h2>Balances</h2>
              <Table label="Merchant balances">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Owed</th>
                    <th>Limit</th>
                    <th>Hold</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((merchant) => (
                    <tr key={merchant.id}>
                      <td>{merchant.name}</td>
                      <td>{formatPKR(merchant.balance)}</td>
                      <td>{formatPKR(threshold)}</td>
                      <td>
                        <StatusBadge tone={merchant.status === 'on_hold' ? 'danger' : 'neutral'}>
                          {merchant.status === 'on_hold' ? 'On hold' : 'None'}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </section>
          </div>
        )}
      </QueryState>
    </>
  );
}
