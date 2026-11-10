'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/form';
import { toApiError } from '@/lib/api/errors';
import { ROUTES } from '@/lib/routes';
import { useRequestSignIn } from '../../hooks';
import styles from './SignInFlow.module.css';

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a full email address, like name@university.edu.pk')),
});

type EmailStepProps = {
  defaultEmail: string;
  onSent: (email: string) => void;
};

export function EmailStep({ defaultEmail, onSent }: EmailStepProps) {
  const request = useRequestSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(emailSchema), defaultValues: { email: defaultEmail } });

  const onSubmit = handleSubmit(({ email }) => {
    request.mutate(email, { onSuccess: () => onSent(email) });
  });

  const error =
    errors.email?.message ?? (request.error ? toApiError(request.error).message : undefined);

  return (
    <form className={styles.step} onSubmit={onSubmit} noValidate>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.sub}>We&apos;ll email you a code. No password needed.</p>
      <TextField
        label="Email"
        className={styles.field}
        placeholder="name@university.edu.pk"
        error={error}
        id="sign-in-email"
        type="email"
        icon={Mail}
        autoComplete="email"
        autoFocus
        {...register('email')}
      />
      <Button type="submit" size="lg" block loading={request.isPending} className={styles.submit}>
        {request.isPending ? 'Sending your code…' : 'Send my code'}
      </Button>
      <p className={styles.alt}>
        New here? <Link href={ROUTES.getVerified}>Get verified, it&apos;s free</Link>
      </p>
      <p className={styles.shops}>Run a shop? Sign in with your business email.</p>
    </form>
  );
}
