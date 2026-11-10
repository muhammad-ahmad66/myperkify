'use client';

import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { Command } from 'cmdk';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useState, type ReactNode, type Ref } from 'react';
import { Icon } from '../../Icon';
import { FieldShell, useFieldIds, type FieldBaseProps } from '../FieldShell';
import shell from '../FieldShell/FieldShell.module.css';
import styles from './ComboboxField.module.css';

export type ComboboxOption = {
  value: string;
  label: string;
  sublabel?: string;
  /** Small mono text on the right, such as an email domain. */
  meta?: string;
  /** Extra words the search should match. */
  keywords?: string[];
};

type ComboboxFieldProps = FieldBaseProps & {
  id?: string;
  name?: string;
  value?: string;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Replaces the list while options load or fail. */
  status?: ReactNode;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
};

/** A searchable list with full keyboard support. */
export function ComboboxField({
  label,
  hint,
  hintTone,
  error,
  valid,
  icon,
  optional,
  className,
  id,
  value,
  options,
  placeholder = 'Choose one',
  searchPlaceholder = 'Search',
  emptyText = 'No matches.',
  status,
  disabled,
  onChange,
  onBlur,
  ref,
}: ComboboxFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) onBlur?.();
  }

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <FieldShell
        fieldId={fieldId}
        messageId={messageId}
        label={label}
        hint={hint}
        hintTone={hintTone}
        error={error}
        valid={valid}
        icon={icon}
        optional={optional}
        className={className}
        disabled={disabled}
        open={open}
        trailing={<Icon icon={ChevronDown} size={18} className={shell.chevron} />}
      >
        <Popover.Trigger asChild>
          <button
            ref={ref}
            id={fieldId}
            type="button"
            className={clsx(shell.input, shell.trigger)}
            disabled={disabled}
            aria-describedby={messageId}
          >
            <span className={clsx(shell.ellipsis, !selected && shell.placeholder)}>
              {selected?.label ?? placeholder}
            </span>
          </button>
        </Popover.Trigger>
      </FieldShell>
      <Popover.Portal>
        <Popover.Content
          className={clsx(shell.popover, styles.content)}
          sideOffset={20}
          align="start"
          alignOffset={icon ? -64 : -18}
        >
          <Command className={styles.command}>
            <div className={styles.search}>
              <Icon icon={Search} size={16} />
              <Command.Input placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
            </div>
            {status ? (
              <div className={styles.status}>{status}</div>
            ) : (
              <Command.List className={styles.list}>
                <Command.Empty className={styles.status}>{emptyText}</Command.Empty>
                {options.map((option) => (
                  <Command.Item
                    key={option.value}
                    value={option.label}
                    keywords={[
                      option.sublabel ?? '',
                      option.meta ?? '',
                      ...(option.keywords ?? []),
                    ]}
                    className={shell.option}
                    onSelect={() => {
                      onChange?.(option.value);
                      changeOpen(false);
                    }}
                  >
                    <span className={shell.optionText}>
                      <b>{option.label}</b>
                      {option.sublabel && <small>{option.sublabel}</small>}
                    </span>
                    {option.meta && <code className={styles.meta}>{option.meta}</code>}
                    {option.value === value && (
                      <Icon
                        icon={Check}
                        size={16}
                        strokeWidth={2.6}
                        className={shell.optionCheck}
                      />
                    )}
                  </Command.Item>
                ))}
              </Command.List>
            )}
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
