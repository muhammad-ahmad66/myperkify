import type { ReactNode } from 'react';
import styles from './Table.module.css';

/** Scrolls inside its own box on phones, so the page itself never moves sideways. */
export function Table({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.scroll} role="region" aria-label={label} tabIndex={0}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}
