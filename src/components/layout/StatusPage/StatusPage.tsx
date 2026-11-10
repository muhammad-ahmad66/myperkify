import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';
import styles from './StatusPage.module.css';

type StatusPageProps = {
  title: string;
  body: string;
  action: ReactNode;
};

/** Full-page message for 404 and route errors. */
export function StatusPage({ title, body, action }: StatusPageProps) {
  return (
    <main className={styles.page}>
      <Logo />
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.body}>{body}</p>
      <div className={styles.action}>{action}</div>
    </main>
  );
}
