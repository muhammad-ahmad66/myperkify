'use client';

import { Hash } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { TextField } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import { Table } from '@/components/ui/Table';
import { formatPKR } from '@/lib/format';
import { useLedger, useSubmitSettlement } from '../../hooks';
import { settlementSchema } from '../../schemas';
import type { Ledger, Settlement } from '../../types';
import { BalanceMeter } from '../BalanceMeter';
import styles from './LedgerView.module.css';

const SETTLEMENT_LABELS: Record<Settlement['status'], [BadgeTone, string]> = {
  submitted: ['waiting', 'Being checked'],
  confirmed: ['success', 'Confirmed'],
  rejected: ['danger', 'Not confirmed'],
};

function SettleForm({ ledger }: { ledger: Ledger }) {
  const settle = useSubmitSettlement();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(settlementSchema), defaultValues: { reference: '' } });
  const isOpen = ledger.settlements.some((settlement) => settlement.status === 'submitted');

  if (isOpen) {
    return (
      <p className={styles.note} role="status">
        <b>Being checked</b>
        Your balance clears as soon as we confirm your transfer.
      </p>
    );
  }
  if (ledger.balance <= 0) {
    return (
      <p className={styles.note} role="status">
        <b>All settled</b>
        You owe nothing right now.
      </p>
    );
  }

  const onSubmit = handleSubmit(({ reference }) => {
    settle.mutate(reference, { onSuccess: () => reset() });
  });

  return (
    <form className={styles.settle} onSubmit={onSubmit} noValidate>
      <h2>Settle now</h2>
      <p>Transfer {formatPKR(ledger.balance)} to MyPerkify, then enter your reference.</p>
      <TextField
        label="Transfer reference"
        className={styles.field}
        placeholder="TRX-204518"
        icon={Hash}
        error={errors.reference?.message}
        id="settle-reference"
        {...register('reference')}
      />
      <Button type="submit" block loading={settle.isPending}>
        {settle.isPending ? 'Sending…' : `Settle ${formatPKR(ledger.balance)}`}
      </Button>
    </form>
  );
}

export function LedgerView() {
  const query = useLedger();

  return (
    <>
      <PageHeader title="Commission ledger" description="5% on completed orders." />
      <QueryState query={query} label="your ledger">
        {(ledger) => (
          <div className={styles.stack}>
            <div className={styles.top}>
              <BalanceMeter
                balance={ledger.balance}
                threshold={ledger.threshold}
                status={ledger.status}
              />
              <SettleForm ledger={ledger} />
            </div>

            {ledger.settlements.length > 0 && (
              <section>
                <h2 className={styles.heading}>Settlements</h2>
                <Table label="Settlements">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.settlements.map((settlement) => {
                      const [tone, label] = SETTLEMENT_LABELS[settlement.status];
                      return (
                        <tr key={settlement.id}>
                          <td>{format(new Date(settlement.createdAt), 'd MMM yyyy')}</td>
                          <td>{settlement.reference}</td>
                          <td>{formatPKR(settlement.amount)}</td>
                          <td>
                            <StatusBadge tone={tone}>{label}</StatusBadge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </section>
            )}

            <section>
              <h2 className={styles.heading}>Line items</h2>
              <Table label="Ledger line items">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order</th>
                    <th>Sale</th>
                    <th>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{format(new Date(entry.createdAt), 'd MMM yyyy')}</td>
                      <td>{entry.orderNumber ?? 'Settlement'}</td>
                      <td>{entry.saleValue === null ? '' : formatPKR(entry.saleValue)}</td>
                      <td>
                        {entry.amount < 0
                          ? `−${formatPKR(-entry.amount)}`
                          : formatPKR(entry.amount)}
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
