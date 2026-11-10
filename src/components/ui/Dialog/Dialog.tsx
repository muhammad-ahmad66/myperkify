'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import styles from './Dialog.module.css';

export const Dialog = RadixDialog.Root;
export const DialogTitle = RadixDialog.Title;
export const DialogDescription = RadixDialog.Description;
export const DialogClose = RadixDialog.Close;

type DialogContentProps = ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
  placement?: 'center' | 'top';
  children: ReactNode;
};

/** Scrim, focus trap, Escape and focus return all come from Radix. */
export function DialogContent({
  placement = 'center',
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={clsx(styles.scrim, styles[placement])}>
        <RadixDialog.Content className={clsx(styles.content, className)} {...props}>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Overlay>
    </RadixDialog.Portal>
  );
}
