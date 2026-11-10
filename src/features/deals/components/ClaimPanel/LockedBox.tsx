'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { TextField } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { lockedEmailSchema } from '@/features/verification/schemas';
import { ROUTES } from '@/lib/routes';
import { useSignupDraftStore } from '@/stores/signupDraftStore';
import type { DealDetail } from '../../types';
import styles from './LockedBox.module.css';

/** "Verify to Unlock" (F-103). The typed email carries over to sign-up. */
export function LockedBox({ deal }: { deal: DealDetail }) {
  const router = useRouter();
  const setDraft = useSignupDraftStore((state) => state.setDraft);
  const returnDeal = { slug: deal.slug, brand: deal.brand.name };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(lockedEmailSchema), defaultValues: { email: '' } });

  const onSubmit = handleSubmit(({ email }) => {
    setDraft({ email, returnDeal });
    router.push(ROUTES.getVerified);
  });

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <Icon icon={Lock} size={17} />
        <strong>Unlock the student price</strong>
      </div>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          label="University email"
          icon={Mail}
          error={errors.email?.message}
          id="locked-email"
          type="email"
          autoComplete="email"
          placeholder="name@university.edu.pk"
          {...register('email')}
        />
        <Button type="submit" size="lg" block>
          Verify to unlock
        </Button>
      </form>
      <p className={styles.note}>
        No uni email?{' '}
        <Link href={ROUTES.getVerifiedByCard} onClick={() => setDraft({ returnDeal })}>
          Use your student card
        </Link>
      </p>
    </div>
  );
}
