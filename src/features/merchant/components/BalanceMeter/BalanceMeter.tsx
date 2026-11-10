import clsx from 'clsx';
import { formatPKR } from '@/lib/format';
import type { MerchantStatus } from '../../types';
import styles from './BalanceMeter.module.css';

const NEAR_THRESHOLD = 0.75;

type BalanceMeterProps = {
  balance: number;
  threshold: number;
  status: MerchantStatus;
};

export function BalanceMeter({ balance, threshold, status }: BalanceMeterProps) {
  const ratio = Math.min(1, Math.max(0, balance / threshold));
  const onHold = status === 'on_hold';
  const isNear = !onHold && ratio >= NEAR_THRESHOLD;

  return (
    <div className={styles.box}>
      <div className={styles.top}>
        <div>
          <span>Commission owed</span>
          <b>{formatPKR(balance)}</b>
        </div>
        <span>Settle at {formatPKR(threshold)}</span>
      </div>
      <div
        className={styles.meter}
        role="meter"
        aria-label="Commission owed against your limit"
        aria-valuemin={0}
        aria-valuemax={threshold}
        aria-valuenow={Math.max(0, balance)}
      >
        <i
          className={clsx(isNear && styles.near, onHold && styles.hold)}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {onHold && (
        <p className={styles.notice} role="alert">
          New claims and orders are paused. Settle your balance to start taking them again.
        </p>
      )}
      {isNear && (
        <p className={styles.notice}>
          You&apos;re close to your limit. New orders pause at {formatPKR(threshold)}, so settle
          soon.
        </p>
      )}
    </div>
  );
}
