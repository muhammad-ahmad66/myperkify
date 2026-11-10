'use client';

import clsx from 'clsx';
import { Heart } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { useToggleSave } from '../../hooks';
import styles from './SaveButton.module.css';

type SaveButtonProps = {
  dealId: string;
  brandName: string;
  saved: boolean;
  size?: 'card' | 'cover';
  className?: string;
};

export function SaveButton({
  dealId,
  brandName,
  saved,
  size = 'card',
  className,
}: SaveButtonProps) {
  const { toggle, isPending } = useToggleSave();

  return (
    <button
      type="button"
      className={clsx(styles.save, styles[size], className)}
      aria-pressed={saved}
      aria-label={`Save ${brandName}`}
      aria-busy={isPending}
      onClick={() => toggle({ dealId, saved: !saved })}
    >
      <Icon icon={Heart} size={size === 'card' ? 16 : 20} />
    </button>
  );
}
