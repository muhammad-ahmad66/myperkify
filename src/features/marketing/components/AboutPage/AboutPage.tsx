import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Wrap } from '@/components/ui/Wrap';
import { ROUTES } from '@/lib/routes';
import styles from './AboutPage.module.css';

export function AboutPage() {
  return (
    <main className={styles.page}>
      <Wrap>
        <h1 className={styles.title}>Student prices, without the friction.</h1>
        <div className={styles.photo}>
          <Image
            src="/images/auth/students.webp"
            alt="Five students laughing together"
            fill
            priority
            sizes="(max-width: 1240px) 100vw, 1200px"
          />
        </div>
        <div className={styles.cards}>
          <section>
            <h2>For students</h2>
            <p>Verify once with a university email or student card. Free, and no CNIC, ever.</p>
            <ButtonLink href={ROUTES.deals} size="lg">
              Browse deals
              <Icon icon={ArrowRight} size={16} />
            </ButtonLink>
          </section>
          <section>
            <h2>For shops</h2>
            <p>5% on completed orders and nothing else. No QR stands, nothing to install.</p>
            <ButtonLink href={ROUTES.business} size="lg" variant="ghost">
              List your business
              <Icon icon={ArrowRight} size={16} />
            </ButtonLink>
          </section>
        </div>
      </Wrap>
    </main>
  );
}
