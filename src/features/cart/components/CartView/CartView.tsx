'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandTile } from '@/components/ui/BrandTile';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { Wrap } from '@/components/ui/Wrap';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { useCart, useRemoveCartLine, useUpdateCartLine } from '../../hooks';
import type { CartLine } from '../../types';
import { CartSummaryPanel } from '../CartSummaryPanel';
import styles from './CartView.module.css';

function LineRow({ line }: { line: CartLine }) {
  const update = useUpdateCartLine();
  const remove = useRemoveCartLine();
  const busy = update.isPending || remove.isPending;

  return (
    <li className={styles.line} aria-busy={busy}>
      <span className={styles.thumb}>
        {line.image && <Image src={line.image} alt="" fill sizes="84px" />}
      </span>
      <div className={styles.lineText}>
        <Link href={ROUTES.deal(line.dealSlug)}>{line.title}</Link>
        {line.optionLabel !== line.title && <span>{line.optionLabel}</span>}
      </div>
      <div className={styles.price}>
        <b>{formatPKR(line.studentPrice * line.quantity)}</b>
        <s>{formatPKR(line.regularPrice * line.quantity)}</s>
      </div>
      <div className={styles.controls}>
        <div className={styles.stepper}>
          <button
            type="button"
            aria-label={`One less ${line.optionLabel}`}
            disabled={busy || line.quantity <= 1}
            onClick={() => update.mutate({ id: line.id, quantity: line.quantity - 1 })}
          >
            <Icon icon={Minus} size={15} />
          </button>
          <output aria-live="polite">{line.quantity}</output>
          <button
            type="button"
            aria-label={`One more ${line.optionLabel}`}
            disabled={busy || line.quantity >= line.maxQuantity}
            onClick={() => update.mutate({ id: line.id, quantity: line.quantity + 1 })}
          >
            <Icon icon={Plus} size={15} />
          </button>
        </div>
        <button
          type="button"
          className={styles.remove}
          disabled={busy}
          aria-label={`Remove ${line.optionLabel}`}
          onClick={() => remove.mutate(line.id)}
        >
          <Icon icon={Trash2} size={17} />
        </button>
      </div>
    </li>
  );
}

export function CartView() {
  const query = useCart();

  return (
    <main className={styles.page}>
      <Wrap>
        <PageHeader title="Your cart" />
        <QueryState
          query={query}
          label="your cart"
          isEmpty={(cart) => cart.itemCount === 0}
          empty={
            <>
              Your cart is empty.{' '}
              <Link className={styles.browse} href={ROUTES.deals}>
                Browse deals
              </Link>
            </>
          }
        >
          {(cart) => (
            <div className={styles.layout}>
              <div className={styles.groups}>
                {cart.groups.map((group) => (
                  <section key={group.merchantId} className={styles.group}>
                    <header>
                      <BrandTile initials={group.initials} color={group.color} size="sm" />
                      <strong>{group.merchantName}</strong>
                    </header>
                    <ul>
                      {group.lines.map((line) => (
                        <LineRow key={line.id} line={line} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <CartSummaryPanel cart={cart}>
                <ButtonLink href={ROUTES.checkout} size="lg" block>
                  Go to checkout
                </ButtonLink>
              </CartSummaryPanel>
            </div>
          )}
        </QueryState>
      </Wrap>
    </main>
  );
}
