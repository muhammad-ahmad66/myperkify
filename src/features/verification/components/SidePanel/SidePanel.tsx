import clsx from 'clsx';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import type { SignupStep } from '../../types';
import styles from './SidePanel.module.css';

const STAGE_BY_STEP: Record<SignupStep, number> = {
  account: 0,
  code: 1,
  card: 1,
  pending: 1,
  rejected: 1,
  done: 2,
};

const STEPS = ['Create your account', "Prove you're a student", 'Start saving'];
const PROMISES = ['No CNIC, ever', 'Brands never see your ID', 'PKR 0, always'];

export function SidePanel({ step }: { step: SignupStep }) {
  const stage = STAGE_BY_STEP[step];

  return (
    <aside className={styles.side}>
      <Image
        src="/images/auth/students.webp"
        alt=""
        fill
        priority
        sizes="50vw"
        className={styles.photo}
      />
      <div className={styles.content}>
        <span className={styles.logoOnPhoto}>
          <Logo tone="light" />
        </span>
        <span className={styles.logoPlain}>
          <Logo />
        </span>
        <h1 className={styles.title}>Three steps to the student price.</h1>

        <div className={styles.compact} aria-hidden="true">
          {STEPS.map((title, index) => (
            <i
              key={title}
              className={clsx(
                index < stage && styles.compactDone,
                index === stage && styles.compactOn,
              )}
            />
          ))}
        </div>

        <ol className={styles.progress} aria-label="Sign-up progress">
          {STEPS.map((title, index) => {
            const state = index < stage ? 'done' : index === stage ? 'current' : 'todo';
            return (
              <li
                key={title}
                data-state={state}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className={styles.dot}>
                  {state === 'done' ? <Icon icon={Check} size={15} strokeWidth={3} /> : index + 1}
                </span>
                <b>{title}</b>
              </li>
            );
          })}
        </ol>

        <ul className={styles.promises}>
          {PROMISES.map((promise) => (
            <li key={promise}>{promise}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
