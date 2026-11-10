import type { Metadata } from 'next';
import { StaticPage } from '@/features/marketing/components/StaticPage';
import styles from '@/features/marketing/components/StaticPage/StaticPage.module.css';

export const metadata: Metadata = { title: 'Terms', robots: { index: false } };

/** Legal text must come from the client (docs/04, section 27). */
export default function TermsPage() {
  return (
    <StaticPage title="Terms">
      <p className={styles.notice}>Our terms of use are being finalised.</p>
    </StaticPage>
  );
}
