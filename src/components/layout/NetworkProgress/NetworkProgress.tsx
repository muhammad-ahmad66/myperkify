'use client';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import styles from './NetworkProgress.module.css';

/** A thin bar at the top of the page while a request runs. Polling stays quiet. */
export function NetworkProgress() {
  const fetching = useIsFetching({ predicate: (query) => !query.meta?.background });
  const mutating = useIsMutating();
  if (fetching + mutating === 0) return null;

  return <div className={styles.bar} role="progressbar" aria-label="Loading" />;
}
