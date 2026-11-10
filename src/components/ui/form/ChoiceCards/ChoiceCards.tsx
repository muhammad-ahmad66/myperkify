'use client';

import * as RadioGroup from '@radix-ui/react-radio-group';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { Icon } from '../../Icon';
import { FieldMessage, useFieldIds } from '../FieldShell';
import styles from './ChoiceCards.module.css';

export type ChoiceOption = {
  value: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
};

type ChoiceCardsProps = {
  label: ReactNode;
  options: ChoiceOption[];
  value?: string;
  columns?: 2 | 3;
  id?: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLDivElement>;
};

/** A radio group shown as cards. Use when each choice needs a line of explanation. */
export function ChoiceCards({
  label,
  options,
  value,
  columns = 2,
  id,
  hint,
  error,
  className,
  onChange,
  onBlur,
  ref,
}: ChoiceCardsProps) {
  const { fieldId, messageId } = useFieldIds(id);
  const labelId = `${fieldId}-label`;

  return (
    <div className={clsx(styles.root, className)}>
      <span className={styles.label} id={labelId}>
        {label}
      </span>
      <RadioGroup.Root
        ref={ref}
        className={clsx(styles.cards, columns === 3 && styles.three)}
        value={value}
        onValueChange={onChange}
        onBlur={onBlur}
        aria-labelledby={labelId}
        aria-describedby={messageId}
      >
        {options.map((option) => (
          <RadioGroup.Item key={option.value} value={option.value} className={styles.card}>
            {option.icon && (
              <span className={styles.icon}>
                <Icon icon={option.icon} />
              </span>
            )}
            <b>{option.title}</b>
            {option.description && <small>{option.description}</small>}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
}
