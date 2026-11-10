'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Button } from '../Button';
import { Skeleton } from '../Skeleton';
import { StateMessage } from '../StateMessage';
import styles from './QueryState.module.css';

type QueryStateProps<T> = {
  query: UseQueryResult<T>;
  /** What failed, as in "We couldn't load your orders". */
  label: string;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
};

/** The loading, error and empty states every data view needs. */
export function QueryState<T>({ query, label, isEmpty, empty, children }: QueryStateProps<T>) {
  if (query.isPending) {
    return (
      <div className={styles.loading} aria-busy="true">
        <Skeleton className={styles.row} />
        <Skeleton className={styles.row} />
        <Skeleton className={styles.row} />
      </div>
    );
  }

  if (query.isError) {
    return (
      <StateMessage
        role="alert"
        action={
          <Button
            variant="ghost"
            size="sm"
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Try again
          </Button>
        }
      >
        We couldn&apos;t load {label}. Check your connection and try again.
      </StateMessage>
    );
  }

  if (isEmpty?.(query.data)) return <StateMessage>{empty}</StateMessage>;
  return children(query.data);
}
