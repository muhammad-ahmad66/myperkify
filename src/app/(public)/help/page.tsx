import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqList } from '@/features/marketing/components/FaqList';
import { StaticPage } from '@/features/marketing/components/StaticPage';
import styles from '@/features/marketing/components/StaticPage/StaticPage.module.css';
import { BUSINESS_FAQS, FAQS } from '@/features/marketing/content';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: 'Help' };

export default function HelpPage() {
  return (
    <StaticPage title="How can we help?" wide>
      <div className={styles.columns}>
        <section>
          <h2>For students</h2>
          <FaqList faqs={FAQS} />
        </section>
        <section>
          <h2>For shops</h2>
          <FaqList faqs={BUSINESS_FAQS} />
        </section>
      </div>
      <p className={styles.after}>
        Still stuck? <Link href={ROUTES.contact}>Send us a message</Link>
      </p>
    </StaticPage>
  );
}
