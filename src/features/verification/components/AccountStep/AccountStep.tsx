'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, GraduationCap, IdCard, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import {
  CheckboxField,
  ChoiceCards,
  ComboboxField,
  FormError,
  TextField,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';
import { useViewer } from '@/features/session/hooks';
import { toApiError } from '@/lib/api/errors';
import { API_ERROR_CODES } from '@/lib/api/types';
import { ROUTES } from '@/lib/routes';
import { useSignupDraftStore } from '@/stores/signupDraftStore';
import { useCreateAccount, useUniversities } from '../../hooks';
import { classifyEmail, findUniversityByEmail } from '../../lib/emailDomain';
import { accountSchema } from '../../schemas';
import type { AccountValues } from '../../types';
import stepStyles from '../step.module.css';
import styles from './AccountStep.module.css';

type AccountStepProps = {
  preferCard: boolean;
  onSent: (method: AccountValues['method']) => void;
};

const METHODS = [
  {
    value: 'email',
    title: 'University email',
    description: 'Instant, with a 6-digit code',
    icon: Mail,
  },
  {
    value: 'card',
    title: 'Student card photo',
    description: 'Checked by our team within a day',
    icon: IdCard,
  },
];

function emailHint(method: AccountValues['method'], email: string) {
  const kind = classifyEmail(email);
  if (method === 'card') {
    return {
      tone: kind === 'none' ? ('neutral' as const) : ('success' as const),
      text: "Any email works. We'll tell you here when your card is approved.",
    };
  }
  if (kind === 'university') {
    return { tone: 'success' as const, text: "University email. You'll be verified instantly." };
  }
  if (kind === 'personal') {
    return {
      tone: 'warning' as const,
      text: "That's a personal email. Use your uni email, or choose Student card photo above.",
    };
  }
  if (kind === 'other') {
    return {
      tone: 'warning' as const,
      text: "We don't recognise this domain. Choose Student card photo above instead.",
    };
  }
  return { tone: 'neutral' as const, text: 'Ends in .edu.pk for most universities.' };
}

export function AccountStep({ preferCard, onSent }: AccountStepProps) {
  const draftEmail = useSignupDraftStore((state) => state.email);
  const { viewer } = useViewer();
  const student = viewer.kind === 'student' ? viewer : null;
  const universitiesQuery = useUniversities();
  const universities = useMemo(() => universitiesQuery.data ?? [], [universitiesQuery.data]);
  const universityOptions = useMemo(
    () =>
      universities.map((university) => ({
        value: university.id,
        label: university.name,
        sublabel: university.city,
        meta: university.emailDomains[0],
      })),
    [universities],
  );
  const createAccount = useCreateAccount();

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: student?.name ?? '',
      universityId: '',
      method: preferCard ? 'card' : 'email',
      email: student?.email ?? draftEmail,
      acceptedTerms: false,
    },
  });

  const method = useWatch({ control, name: 'method' });
  const email = useWatch({ control, name: 'email' });
  const hint = useMemo(() => emailHint(method, email), [method, email]);

  /* Suggest the university from the email domain if none is picked yet. */
  useEffect(() => {
    const match = findUniversityByEmail(email, universities);
    if (match && !getValues('universityId')) {
      setValue('universityId', match.id, { shouldValidate: true });
    }
  }, [email, universities, getValues, setValue]);

  const onSubmit = handleSubmit((values) => {
    createAccount.mutate(values, {
      onSuccess: () => onSent(values.method),
      onError: (error) => {
        const apiError = toApiError(error);
        const fields = Object.entries(apiError.fields ?? {});
        if (fields.length === 0) {
          setError('root', { message: apiError.message });
          return;
        }
        fields.forEach(([field, message], index) => {
          setError(field as keyof AccountValues, { message }, { shouldFocus: index === 0 });
        });
      },
    });
  });

  const emailTaken =
    createAccount.error && toApiError(createAccount.error).code === API_ERROR_CODES.emailTaken;

  return (
    <form className={stepStyles.step} onSubmit={onSubmit} noValidate>
      <span className={stepStyles.eyebrow}>Step 1 of 3</span>
      <h2 className={stepStyles.title}>Create your free account</h2>
      <p className={stepStyles.sub}>Use the name on your student card.</p>

      <div className={styles.fields}>
        <TextField
          id="full-name"
          label="Full name"
          placeholder="Ayesha Khan"
          icon={User}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Controller
          control={control}
          name="universityId"
          render={({ field }) => (
            <ComboboxField
              id="university"
              label="University or college"
              placeholder="Choose your university"
              searchPlaceholder="Search universities"
              emptyText={'No match. Choose "My university isn\'t listed".'}
              icon={GraduationCap}
              options={universityOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={errors.universityId?.message}
              status={
                universitiesQuery.isPending ? (
                  'Loading universities…'
                ) : universitiesQuery.isError ? (
                  <button
                    type="button"
                    className={stepStyles.linkButton}
                    onClick={() => void universitiesQuery.refetch()}
                  >
                    We couldn&apos;t load the list. Try again
                  </button>
                ) : undefined
              }
            />
          )}
        />

        <Controller
          control={control}
          name="method"
          render={({ field }) => (
            <ChoiceCards
              label="How do you want to verify?"
              options={METHODS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />

        <TextField
          id="email"
          type="email"
          label={method === 'card' ? 'Email for updates' : 'University email'}
          placeholder={method === 'card' ? 'you@example.com' : 'name@university.edu.pk'}
          icon={Mail}
          autoComplete="email"
          spellCheck={false}
          hint={hint.text}
          hintTone={hint.tone}
          error={errors.email?.message}
          {...register('email')}
        />

        {emailTaken && (
          <p className={styles.taken}>
            <Link href={ROUTES.signIn}>Sign in to your account</Link>
          </p>
        )}

        <Controller
          control={control}
          name="acceptedTerms"
          render={({ field }) => (
            <CheckboxField
              id="terms"
              label={
                <>
                  I agree to the <Link href={ROUTES.terms}>Terms</Link> and{' '}
                  <Link href={ROUTES.privacy}>Privacy policy</Link>.
                </>
              }
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={errors.acceptedTerms?.message}
            />
          )}
        />
      </div>

      <FormError>{errors.root?.message}</FormError>

      <Button
        type="submit"
        size="lg"
        block
        className={stepStyles.submit}
        loading={createAccount.isPending}
      >
        {createAccount.isPending
          ? method === 'card'
            ? 'Saving your details…'
            : 'Sending your code…'
          : method === 'card'
            ? 'Continue to card upload'
            : 'Send my code'}
        {!createAccount.isPending && <Icon icon={ArrowRight} size={16} />}
      </Button>
    </form>
  );
}
