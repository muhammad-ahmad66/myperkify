'use client';

import clsx from 'clsx';
import { Check } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import type { RegisterStep, StepId } from '../RegisterFlow/steps';
import styles from './RegisterSide.module.css';

const TRUST = [
  { value: '5%', label: 'on completed orders only' },
  { value: 'PKR 0', label: 'to join, no monthly plan' },
  { value: 'No hardware', label: 'approve on any screen' },
];

type RegisterSideProps = {
  steps: RegisterStep[];
  index: number;
  furthest: number;
  onSelect: (step: StepId) => void;
};

export function RegisterSide({ steps, index, furthest, onSelect }: RegisterSideProps) {
  return (
    <aside className={styles.side}>
      <Logo tone="light" />
      <h1 className={styles.title}>List your business on MyPerkify.</h1>
      <p className={styles.lede}>Reach verified students, and pay only when they buy.</p>

      <div className={styles.compact} aria-hidden="true">
        {steps.map((step, stepIndex) => (
          <i
            key={step.id}
            className={clsx(
              stepIndex < index && styles.compactDone,
              stepIndex === index && styles.compactOn,
            )}
          />
        ))}
      </div>

      <ol className={styles.progress} aria-label="Application progress">
        {steps.map((step, stepIndex) => {
          const state = stepIndex < index ? 'done' : stepIndex === index ? 'current' : 'todo';
          return (
            <li key={step.id} className={styles.item} data-state={state}>
              <button
                type="button"
                disabled={stepIndex > furthest}
                aria-current={state === 'current' ? 'step' : undefined}
                onClick={() => onSelect(step.id)}
              >
                <span className={styles.dot}>
                  {state === 'done' ? (
                    <Icon icon={Check} size={15} strokeWidth={3} />
                  ) : (
                    stepIndex + 1
                  )}
                </span>
                <span>
                  <b>{step.title}</b>
                  <small>{step.summary}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <dl className={styles.trust}>
        {TRUST.map((fact) => (
          <div key={fact.value}>
            <dt>{fact.value}</dt>
            <dd>{fact.label}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
