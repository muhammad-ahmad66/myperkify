import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Wrap } from '@/components/ui/Wrap';
import styles from './StaticPage.module.css';

type StaticPageProps = {
  title: string;
  lede?: string;
  /** For pages that lay out their own columns. */
  wide?: boolean;
  children: ReactNode;
};

export function StaticPage({ title, lede, wide = false, children }: StaticPageProps) {
  return (
    <main className={styles.page}>
      <Wrap className={clsx(!wide && styles.narrow)}>
        <h1>{title}</h1>
        {lede && <p className={styles.lede}>{lede}</p>}
        <div className={styles.body}>{children}</div>
      </Wrap>
    </main>
  );
}
