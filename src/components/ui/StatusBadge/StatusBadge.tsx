import clsx from 'clsx';
import styles from './StatusBadge.module.css';

export type BadgeTone = 'success' | 'waiting' | 'danger' | 'neutral';

/** A state is always shown with words, never colour alone. */
export function StatusBadge({ tone, children }: { tone: BadgeTone; children: string }) {
  return <span className={clsx(styles.badge, styles[tone])}>{children}</span>;
}
