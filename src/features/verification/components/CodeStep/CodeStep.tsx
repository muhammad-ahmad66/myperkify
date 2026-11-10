'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { CodeField } from '@/components/ui/form';
import { toApiError } from '@/lib/api/errors';
import { RESEND_SECONDS, VERIFICATION_CODE_LENGTH } from '@/lib/constants';
import { useResendCode, useResendTimer, useVerifyCode } from '../../hooks';
import stepStyles from '../step.module.css';
import styles from './CodeStep.module.css';

type CodeStepProps = {
  email: string;
  onChange: () => void;
  onUseCard: () => void;
};

export function CodeStep({ email, onChange, onUseCard }: CodeStepProps) {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const verify = useVerifyCode();
  const resend = useResendCode();
  const timer = useResendTimer(RESEND_SECONDS);
  const error = verify.error ? toApiError(verify.error).message : undefined;
  const isComplete = code.length === VERIFICATION_CODE_LENGTH;

  function submit(value: string) {
    verify.mutate(value, { onError: () => inputRef.current?.select() });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (isComplete) submit(code);
  }

  function onCodeChange(value: string) {
    setCode(value);
    verify.reset();
  }

  return (
    <form className={stepStyles.step} onSubmit={onSubmit} noValidate>
      <span className={stepStyles.eyebrow}>Step 2 of 3</span>
      <h2 className={stepStyles.title}>Check your uni inbox</h2>
      <p className={stepStyles.sub}>
        We sent a 6-digit code to <b>{email}</b>.{' '}
        <button type="button" className={stepStyles.linkButton} onClick={onChange}>
          Change
        </button>
      </p>

      <div className={styles.field}>
        <CodeField
          label="Verification code"
          ref={inputRef}
          value={code}
          error={error}
          onChange={onCodeChange}
          onComplete={submit}
        />
      </div>

      <p className={styles.resend}>
        {timer.left > 0 ? (
          `Resend code in 0:${String(timer.left).padStart(2, '0')}`
        ) : (
          <>
            Didn&apos;t get it?{' '}
            <button
              type="button"
              className={stepStyles.linkButton}
              disabled={resend.isPending}
              onClick={() => resend.mutate(undefined, { onSuccess: timer.restart })}
            >
              {resend.isPending ? 'Sending…' : 'Resend code'}
            </button>
          </>
        )}
      </p>

      <Button
        type="submit"
        size="lg"
        block
        className={stepStyles.submit}
        disabled={!isComplete}
        loading={verify.isPending}
      >
        {verify.isPending ? 'Checking your code…' : 'Verify and unlock deals'}
      </Button>

      <div className={styles.info}>
        <b>Can&apos;t find it?</b>
        University mail can take a minute. Check junk or &quot;Other&quot; folders, or{' '}
        <button type="button" className={stepStyles.linkButton} onClick={onUseCard}>
          use your student card instead
        </button>
        .
      </div>
    </form>
  );
}
