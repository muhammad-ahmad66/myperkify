import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/features/marketing/components/ContactForm';
import styles from '@/features/marketing/components/ContactForm/ContactForm.module.css';
import { Wrap } from '@/components/ui/Wrap';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <Wrap className={styles.layout}>
        <div>
          <h1>Talk to us</h1>
          <p>Questions about a deal, a claim or your shop?</p>
          <p>
            Quick answers are in <Link href={ROUTES.help}>Help</Link>.
          </p>
        </div>
        <ContactForm />
      </Wrap>
    </main>
  );
}
