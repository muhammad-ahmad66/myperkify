'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useViewer } from '@/features/session/hooks';
import type { VerificationStatus, Viewer } from '@/features/session/types';
import { VERIFICATION_POLL_MS } from '@/lib/constants';
import { ROUTES } from '@/lib/routes';
import type { SignupStep } from '../../types';
import { AccountStep } from '../AccountStep';
import { CardStep } from '../CardStep';
import { CodeStep } from '../CodeStep';
import { PendingStep, RejectedStep } from '../ReviewSteps';
import { SidePanel } from '../SidePanel';
import { VerifiedStep } from '../VerifiedStep';
import styles from './SignupFlow.module.css';

/** The server's status decides the step wherever it can. */
function stepFromViewer(viewer: Viewer, startWithCard: boolean): SignupStep {
  if (viewer.kind === 'student') {
    const { status } = viewer.verification;
    if (status === 'verified') return 'done';
    if (status === 'pending') return 'pending';
    if (status === 'rejected') return 'rejected';
    if (viewer.verification.method === 'card') return 'card';
  }
  return startWithCard ? 'card' : 'account';
}

/** A review decision made elsewhere moves the waiting screens without a reload. */
function resolveStep(local: SignupStep, status: VerificationStatus | null): SignupStep {
  if (status === 'verified') return 'done';
  const isWaiting = local === 'pending' || local === 'rejected';
  if (isWaiting && status === 'rejected') return 'rejected';
  if (isWaiting && status === 'pending') return 'pending';
  return local;
}

export function SignupFlow({ startWithCard }: { startWithCard: boolean }) {
  const { viewer: initialViewer } = useViewer();
  const [localStep, setLocalStep] = useState<SignupStep>(() =>
    stepFromViewer(initialViewer, startWithCard),
  );
  const [preferCard, setPreferCard] = useState(startWithCard);
  const { viewer } = useViewer({
    refetchInterval: localStep === 'pending' ? VERIFICATION_POLL_MS : false,
  });

  const status = viewer.kind === 'student' ? viewer.verification.status : null;
  const step = resolveStep(localStep, status);

  const headingRef = useRef<HTMLDivElement>(null);
  const go = useCallback((next: SignupStep) => {
    setLocalStep(next);
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const backTarget: Partial<Record<SignupStep, SignupStep>> = {
    code: 'account',
    card: 'account',
    pending: 'card',
    rejected: 'card',
  };
  const back = backTarget[step];

  function switchToCard() {
    setPreferCard(true);
    go('card');
  }

  function switchToEmail() {
    setPreferCard(false);
    go('account');
  }

  return (
    <div className={styles.split}>
      <SidePanel step={step} />
      <main className={styles.form}>
        <div className={styles.top}>
          {back && (
            <button type="button" className={styles.back} onClick={() => go(back)}>
              <Icon icon={ChevronLeft} size={16} />
              Back
            </button>
          )}
          {viewer.kind === 'visitor' && (
            <p>
              Already verified? <Link href={ROUTES.signIn}>Sign in</Link>
            </p>
          )}
          <ThemeToggle />
        </div>
        <div className={styles.stage} aria-live="polite" ref={headingRef} tabIndex={-1}>
          {step === 'account' && (
            <AccountStep
              preferCard={preferCard}
              onSent={(method) => go(method === 'card' ? 'card' : 'code')}
            />
          )}
          {step === 'code' && (
            <CodeStep
              email={viewer.kind === 'student' ? viewer.email : ''}
              onChange={() => go('account')}
              onUseCard={switchToCard}
            />
          )}
          {step === 'card' && (
            <CardStep
              isSignedIn={viewer.kind === 'student'}
              onNeedAccount={() => go('account')}
              onUseEmail={switchToEmail}
              onUploaded={() => go('pending')}
            />
          )}
          {step === 'pending' && viewer.kind === 'student' && <PendingStep student={viewer} />}
          {step === 'rejected' && viewer.kind === 'student' && (
            <RejectedStep student={viewer} onRetry={() => go('card')} />
          )}
          {step === 'done' && viewer.kind === 'student' && <VerifiedStep student={viewer} />}
        </div>
      </main>
    </div>
  );
}
