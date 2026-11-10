import type { Metadata } from 'next';
import { StaticPage } from '@/features/marketing/components/StaticPage';
import styles from '@/features/marketing/components/StaticPage/StaticPage.module.css';

export const metadata: Metadata = { title: 'Privacy', robots: { index: false } };

/** Legal text must come from the client (docs/04, section 27). Only confirmed facts are here. */
export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy">
      <p className={styles.notice}>Our full privacy policy is being finalised.</p>
      <p>What is already true:</p>
      <ul>
        <li>We never collect your CNIC or national ID.</li>
        <li>You verify with a university email or a student card photo.</li>
        <li>Student card photos are private and never shared with merchants.</li>
      </ul>
    </StaticPage>
  );
}
