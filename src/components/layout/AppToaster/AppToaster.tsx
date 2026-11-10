'use client';

import { CheckCircle2, CircleAlert } from 'lucide-react';
import { Toaster } from 'sonner';
import { Icon } from '@/components/ui/Icon';
import styles from './AppToaster.module.css';

/** The single Sonner mount, styled to section 10.16 of the design system. */
export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      duration={2600}
      offset={{ bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
      mobileOffset={{ bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
      icons={{
        success: <Icon icon={CheckCircle2} size={16} className={styles.success} />,
        error: <Icon icon={CircleAlert} size={16} className={styles.error} />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: styles.toast,
          actionButton: styles.action,
          title: styles.title,
        },
      }}
    />
  );
}
