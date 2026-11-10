'use client';

import { Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { FileField } from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';
import { toApiError } from '@/lib/api/errors';
import { CARD_MAX_BYTES } from '@/lib/constants';
import { useUploadCard } from '../../hooks';
import { validateCardFile } from '../../schemas';
import stepStyles from '../step.module.css';
import styles from './CardStep.module.css';

const CHECKLIST = ['Your full name', 'University name', 'Valid or expiry date', 'No glare or blur'];

type CardStepProps = {
  isSignedIn: boolean;
  onNeedAccount: () => void;
  onUseEmail: () => void;
  onUploaded: () => void;
};

export function CardStep({ isSignedIn, onNeedAccount, onUseEmail, onUploaded }: CardStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const upload = useUploadCard();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isSignedIn) {
      onNeedAccount();
      return;
    }
    if (file) upload.mutate(file, { onSuccess: onUploaded });
  }

  return (
    <form className={stepStyles.step} onSubmit={onSubmit} noValidate>
      <span className={stepStyles.eyebrow}>Step 2 of 3</span>
      <h2 className={stepStyles.title}>Upload your student card</h2>
      <p className={stepStyles.sub}>
        A person on our team checks it, usually within a day. Only they will ever see it.
      </p>

      <div className={styles.upload}>
        <FileField
          id="student-card"
          label="Student card"
          title="Choose or drop a photo of the front"
          description="JPG or PNG, up to 5 MB"
          accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
          maxBytes={CARD_MAX_BYTES}
          value={file}
          validate={validateCardFile}
          progress={upload.isPending ? upload.progress : undefined}
          error={upload.error ? toApiError(upload.error).message : undefined}
          onChange={(next) => {
            upload.reset();
            setFile(next);
          }}
        />
      </div>

      <p className={styles.checklistLabel}>Make sure we can read</p>
      <ul className={styles.checklist}>
        {CHECKLIST.map((item) => (
          <li key={item}>
            <Icon icon={Check} size={16} strokeWidth={2.4} />
            {item}
          </li>
        ))}
      </ul>

      <Button
        type="submit"
        size="lg"
        block
        className={stepStyles.submit}
        disabled={!file}
        loading={upload.isPending}
      >
        {upload.isPending ? 'Sending…' : 'Send for review'}
      </Button>
      <p className={stepStyles.alt}>
        Have a uni email?{' '}
        <button type="button" className={stepStyles.linkButton} onClick={onUseEmail}>
          Verify instantly instead
        </button>
      </p>
    </form>
  );
}
