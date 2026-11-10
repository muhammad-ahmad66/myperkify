import clsx from 'clsx';
import { CircleAlert, Check, Loader2 } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { StudentViewer } from '@/features/session/types';
import { formatClock } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import stepStyles from '../step.module.css';
import styles from './ReviewSteps.module.css';

export function PendingStep({ student }: { student: StudentViewer }) {
  const { submittedAt } = student.verification;

  return (
    <section className={stepStyles.step}>
      <span className={clsx(styles.badge, styles.wait)}>
        <Icon icon={Loader2} size={30} className={styles.spin} />
      </span>
      <h2 className={clsx(stepStyles.title, styles.badgeTitle)}>We&apos;re checking your card</h2>
      <p className={stepStyles.sub}>
        This usually takes less than a day. We&apos;ll email <b>{student.email}</b> the moment
        you&apos;re approved.
      </p>
      <ol className={styles.timeline}>
        <li>
          <span className={clsx(styles.dot, styles.done)}>
            <Icon icon={Check} size={14} strokeWidth={3} />
          </span>
          <span className={styles.grow}>
            <b>Card received</b>
          </span>
          {submittedAt && <span className={styles.time}>Today {formatClock(submittedAt)}</span>}
        </li>
        <li>
          <span className={clsx(styles.dot, styles.now)} />
          <span className={styles.grow}>
            <b>In review</b> <span className={styles.muted}>by the MyPerkify team</span>
          </span>
        </li>
        <li>
          <span className={clsx(styles.dot, styles.todo)} />
          <span className={clsx(styles.grow, styles.muted)}>Deals unlocked</span>
        </li>
      </ol>
      <ButtonLink href={ROUTES.deals} size="lg" block className={stepStyles.submit}>
        Browse deals while you wait
      </ButtonLink>
    </section>
  );
}

type RejectedStepProps = {
  student: StudentViewer;
  onRetry: () => void;
};

export function RejectedStep({ student, onRetry }: RejectedStepProps) {
  return (
    <section className={stepStyles.step}>
      <span className={clsx(styles.badge, styles.bad)}>
        <Icon icon={CircleAlert} size={28} />
      </span>
      <h2 className={clsx(stepStyles.title, styles.badgeTitle)}>We couldn&apos;t read your card</h2>
      <p className={stepStyles.sub}>
        Nothing is wrong with your account. We just need a clearer photo.
      </p>
      {student.verification.rejectionReason && (
        <div className={styles.note}>
          <span>Note from our team</span>
          <p>{student.verification.rejectionReason}</p>
        </div>
      )}
      <Button size="lg" block className={stepStyles.submit} onClick={onRetry}>
        Upload a new photo
      </Button>
      <p className={stepStyles.alt}>
        Questions? Reply to the email we sent and a person will help.
      </p>
    </section>
  );
}
