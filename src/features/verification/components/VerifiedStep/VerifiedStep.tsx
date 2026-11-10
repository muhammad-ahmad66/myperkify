'use client';

import { ButtonLink } from '@/components/ui/Button';
import type { StudentViewer } from '@/features/session/types';
import { ROUTES } from '@/lib/routes';
import { useSignupDraftStore } from '@/stores/signupDraftStore';
import { IdentityCard } from '../IdentityCard';
import stepStyles from '../step.module.css';
import styles from './VerifiedStep.module.css';

export function VerifiedStep({ student }: { student: StudentViewer }) {
  const returnDeal = useSignupDraftStore((state) => state.returnDeal);

  return (
    <section className={stepStyles.step}>
      <IdentityCard student={student} animate />
      <h2 className={`${stepStyles.title} ${styles.title}`}>
        You&apos;re in. Every student price is unlocked.
      </h2>
      <p className={stepStyles.sub}>
        Claim deals at the counter or order online. Your receipts will appear in your account.
      </p>
      <div className={styles.actions}>
        <ButtonLink href={ROUTES.deals} size="lg">
          Start browsing deals
        </ButtonLink>
        {returnDeal && (
          <ButtonLink href={ROUTES.deal(returnDeal.slug)} variant="ghost" size="lg">
            Back to {returnDeal.brand}
          </ButtonLink>
        )}
      </div>
    </section>
  );
}
