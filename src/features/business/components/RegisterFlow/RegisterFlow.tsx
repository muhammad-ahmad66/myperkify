'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { toApiError } from '@/lib/api/errors';
import { ROUTES } from '@/lib/routes';
import { useApplicationDraft, useSubmitApplication } from '../../hooks';
import { applicationFormSchema, BLANK_APPLICATION, type ApplicationValues } from '../../schemas';
import { ApplicationSent } from '../ApplicationSent';
import { BranchesStep } from '../BranchesStep';
import { BusinessStep } from '../BusinessStep';
import { ContactStep } from '../ContactStep';
import { ProofStep } from '../ProofStep';
import { RegisterSide } from '../RegisterSide';
import styles from './RegisterFlow.module.css';
import { stepsFor, type StepId } from './steps';

export function RegisterFlow() {
  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: BLANK_APPLICATION,
    mode: 'onTouched',
  });
  const draft = useApplicationDraft(form);
  const submit = useSubmitApplication();

  const [stepId, setStepId] = useState<StepId>('business');
  const [furthest, setFurthest] = useState(0);
  const redemption = useWatch({ control: form.control, name: 'redemption' });
  const steps = stepsFor(redemption);

  // An online shop has no branches step, so landing on it moves to the next one.
  const found = steps.findIndex((step) => step.id === stepId);
  const index = found === -1 ? steps.findIndex((step) => step.id === 'contact') : found;
  const step = steps[index] ?? steps[0];
  const isLast = index === steps.length - 1;

  function goTo(id: StepId) {
    setStepId(id);
    window.scrollTo({ top: 0 });
  }

  async function next() {
    if (!step) return;
    const valid = await form.trigger(step.fields, { shouldFocus: true });
    if (!valid) return;
    const target = steps[index + 1];
    if (!target) return;
    setFurthest(Math.max(furthest, index + 1));
    goTo(target.id);
  }

  const onSubmit = form.handleSubmit((values) => {
    submit.mutate(values, {
      onError: (error) => {
        const apiError = toApiError(error);
        if (apiError.fields?.email) {
          form.setError('email', { message: apiError.fields.email });
          goTo('contact');
        }
      },
    });
  });

  if (submit.data) {
    return (
      <ApplicationSent
        reference={submit.data.reference}
        tradingName={form.getValues('tradingName')}
        email={form.getValues('email')}
      />
    );
  }

  const serverError =
    submit.error && !toApiError(submit.error).fields ? toApiError(submit.error).message : undefined;

  return (
    <div className={styles.split}>
      <RegisterSide steps={steps} index={index} furthest={furthest} onSelect={goTo} />

      <main className={styles.main}>
        <div className={styles.top}>
          <span className={styles.draft} role="status">
            {draft === 'saved' && (
              <>
                <Icon icon={Check} size={14} strokeWidth={2.6} />
                Draft saved
              </>
            )}
          </span>
          <p className={styles.signIn}>
            Already listed? <Link href={ROUTES.signIn}>Sign in</Link>
          </p>
          <ThemeToggle />
        </div>

        <FormProvider {...form}>
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <span className={styles.eyebrow}>
              Step {index + 1} of {steps.length}
            </span>
            <h2 className={styles.heading}>{step?.heading}</h2>
            <p className={styles.sub}>{step?.sub}</p>

            <div className={styles.body} key={step?.id}>
              {step?.id === 'business' && <BusinessStep />}
              {step?.id === 'branches' && <BranchesStep />}
              {step?.id === 'contact' && <ContactStep />}
              {step?.id === 'proof' && <ProofStep />}
            </div>

            <FormError>{serverError}</FormError>

            <div className={styles.actions}>
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => goTo(steps[index - 1]?.id ?? 'business')}
                >
                  <Icon icon={ArrowLeft} size={16} />
                  Back
                </Button>
              )}
              {/* Separate keys: reusing one button would let the Continue click also submit. */}
              {isLast ? (
                <Button
                  key="send"
                  type="submit"
                  size="lg"
                  className={styles.primary}
                  loading={submit.isPending}
                >
                  {submit.isPending ? 'Sending your application…' : 'Send application'}
                </Button>
              ) : (
                <Button key="continue" size="lg" className={styles.primary} onClick={next}>
                  Continue
                  <Icon icon={ArrowRight} size={16} />
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
