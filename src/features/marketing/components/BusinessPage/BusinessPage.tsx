import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Wrap } from '@/components/ui/Wrap';
import { ROUTES } from '@/lib/routes';
import { BUSINESS_FACTS, BUSINESS_STEPS } from '../../content';
import { Calculator } from '../Calculator';
import { Process } from '../Process';
import styles from './BusinessPage.module.css';

export function BusinessPage() {
  return (
    <main>
      <section className={styles.hero}>
        <Image
          src="/images/business/hero.webp"
          alt="A busy restaurant counter surrounded by plants"
          fill
          priority
          sizes="100vw"
          className={styles.photo}
        />
        <Wrap className={styles.inner}>
          <div className={styles.copy}>
            <h1 className={styles.title}>
              <span>Bring students in.</span>
              <span>
                Pay 5% <em>only</em>
              </span>
              <span>
                <em>when they buy.</em>
              </span>
            </h1>
            <p className={styles.lede}>
              List a deal. Approve it at your counter. Nothing to install.
            </p>
            <div className={styles.actions}>
              <ButtonLink href={ROUTES.businessRegister} size="lg" variant="inverse">
                List your business
                <Icon icon={ArrowRight} size={16} />
              </ButtonLink>
              <p className={styles.signIn}>
                Already listed? <Link href={ROUTES.signIn}>Sign in</Link>
              </p>
            </div>
          </div>
          <dl className={styles.facts}>
            {BUSINESS_FACTS.map((fact) => (
              <div key={fact.value}>
                <dt>{fact.value}</dt>
                <dd>{fact.label}</dd>
              </div>
            ))}
          </dl>
        </Wrap>
      </section>

      <Process steps={BUSINESS_STEPS} plain />

      <section className={styles.section} aria-labelledby="calculator-title">
        <Wrap>
          <Calculator titleId="calculator-title" />
        </Wrap>
      </section>
    </main>
  );
}
