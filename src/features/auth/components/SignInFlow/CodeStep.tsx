'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { CodeField } from '@/components/ui/form';
import { homeFor } from '@/features/session/routing';
import { useResendTimer } from '@/features/verification/hooks';
import { toApiError } from '@/lib/api/errors';
import { RESEND_SECONDS, VERIFICATION_CODE_LENGTH } from '@/lib/constants';
import { useConfirmSignIn, useRequestSignIn } from '../../hooks';
import styles from './SignInFlow.module.css';

type CodeStepProps = {
  email: string;
  onChangeEmail: () => void;
};

export function CodeStep({ email, onChangeEmail }: CodeStepProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirmSignIn();
  const resend = useRequestSignIn();
  const timer = useResendTimer(RESEND_SECONDS);

  const isComplete = code.length === VERIFICATION_CODE_LENGTH;
  const error = confirm.error ? toApiError(confirm.error).message : undefined;

  function submit(value: string) {
    confirm.mutate(
      { email, code: value },
      {
        onSuccess: (viewer) => {
          router.replace(homeFor(viewer));
          router.refresh();
        },
        onError: () => inputRef.current?.select(),
      },
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (isComplete) submit(code);
  }

  function onCodeChange(value: string) {
    setCode(value);
    confirm.reset();
  }

  function resendCode() {
    resend.mutate(email, {
      onSuccess: () => {
        timer.restart();
        toast.success('New code sent');
      },
      onError: (failure) => {
        toast.error(toApiError(failure).message);
      },
    });
  }

  return (
    <form className={styles.step} onSubmit={onSubmit} noValidate>
      <h1 className={styles.title}>Check your inbox</h1>
      <p className={styles.sub}>
        Code sent to <b>{email}</b>.{' '}
        <button type="button" className={styles.link} onClick={onChangeEmail}>
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
      <Button
        type="submit"
        size="lg"
        block
        className={styles.submit}
        disabled={!isComplete}
        loading={confirm.isPending}
      >
        {confirm.isPending ? 'Checking your code…' : 'Sign in'}
      </Button>
      <p className={styles.alt}>
        {timer.left > 0 ? (
          `Resend code in 0:${String(timer.left).padStart(2, '0')}`
        ) : (
          <>
            Didn&apos;t get it?{' '}
            <button
              type="button"
              className={styles.link}
              disabled={resend.isPending}
              onClick={resendCode}
            >
              {resend.isPending ? 'Sending…' : 'Resend code'}
            </button>
          </>
        )}
      </p>
    </form>
  );
}
