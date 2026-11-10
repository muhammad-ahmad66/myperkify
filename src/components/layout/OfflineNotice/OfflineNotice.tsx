'use client';

import { WifiOff } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/Icon';
import styles from './OfflineNotice.module.css';

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

export function OfflineNotice() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  if (online) return null;

  return (
    <div className={styles.notice} role="status">
      <Icon icon={WifiOff} size={16} />
      You&apos;re offline. Anything you&apos;ve typed is safe.
    </div>
  );
}
