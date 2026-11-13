import clsx from 'clsx';
import { Banknote } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Icon } from '@/components/ui/Icon';
import { CLAIM_WINDOW_SECONDS } from '@/lib/constants';
import { formatPKR, formatTimer } from '@/lib/format';
import styles from './VoucherTicket.module.css';

const RING_LENGTH = 125.66;

type VoucherTicketProps = {
  code: string;
  /** The rolling QR token. Null while the first one loads. */
  pass?: string | null;
  amount: number;
  secondsLeft: number;
  note?: string;
  /** Smaller ticket for the phone mockup on the homepage. */
  compact?: boolean;
};

/** The most important component in the product. The digits must read at arm's length. */
export function VoucherTicket({
  code,
  pass,
  amount,
  secondsLeft,
  note = 'New code every claim. Screenshots won’t work.',
  compact = false,
}: VoucherTicketProps) {
  const offset = RING_LENGTH * (1 - secondsLeft / CLAIM_WINDOW_SECONDS);

  return (
    <div className={clsx(styles.ticket, compact && styles.compact)}>
      <span className={styles.label}>Show this code to the cashier</span>
      {pass !== undefined && (
        <div className={styles.qr}>
          {pass ? (
            <QRCode
              value={pass}
              size={168}
              level="M"
              bgColor="#ffffff"
              fgColor="#0f172a"
              role="img"
              aria-label="QR code for the cashier to scan"
            />
          ) : (
            <span className={styles.qrLoading} aria-hidden="true" />
          )}
        </div>
      )}
      {pass !== undefined && <span className={styles.or}>or read out the code</span>}
      <div className={styles.digits} role="img" aria-label={`Code ${code.split('').join(' ')}`}>
        {code.split('').map((digit, index) => (
          <span key={index} aria-hidden="true">
            {digit}
          </span>
        ))}
      </div>
      <div className={styles.perforation} />
      <div className={styles.timer}>
        <svg className={styles.ring} viewBox="0 0 46 46" aria-hidden="true">
          <circle className={styles.track} cx="23" cy="23" r="20" />
          <circle
            className={styles.bar}
            cx="23"
            cy="23"
            r="20"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={offset.toFixed(2)}
          />
        </svg>
        <div>
          <strong>{formatTimer(secondsLeft)}</strong>
          <small>{note}</small>
        </div>
      </div>
      <div className={styles.pay}>
        <Icon icon={Banknote} size={16} />
        Pay {formatPKR(amount)} cash at counter
      </div>
    </div>
  );
}
