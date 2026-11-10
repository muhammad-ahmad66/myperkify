import { Check } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { ROUTES } from '@/lib/routes';
import styles from './ApplicationSent.module.css';

type ApplicationSentProps = {
  reference: string;
  tradingName: string;
  email: string;
};

export function ApplicationSent({ reference, tradingName, email }: ApplicationSentProps) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Logo />
        <span className={styles.badge}>
          <Icon icon={Check} size={30} strokeWidth={2.6} />
        </span>
        <h1>We&apos;ve got your application.</h1>
        <p className={styles.sub}>
          Our team is reviewing {tradingName}. We&apos;ll email <b>{email}</b> as soon as there is
          news.
        </p>

        <ol className={styles.timeline}>
          <li>
            <span className={styles.done}>
              <Icon icon={Check} size={14} strokeWidth={3} />
            </span>
            <span className={styles.grow}>
              <b>Application received</b>
            </span>
            <code>{reference}</code>
          </li>
          <li>
            <span className={styles.now} />
            <span className={styles.grow}>
              <b>In review</b> by the MyPerkify team
            </span>
          </li>
          <li>
            <span className={styles.todo} />
            <span className={`${styles.grow} ${styles.muted}`}>
              Sign in and list your first deal
            </span>
          </li>
        </ol>

        <div className={styles.actions}>
          <ButtonLink href={ROUTES.home} size="lg">
            Back to MyPerkify
          </ButtonLink>
          <ButtonLink href={ROUTES.business} variant="ghost" size="lg">
            How it works for shops
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
