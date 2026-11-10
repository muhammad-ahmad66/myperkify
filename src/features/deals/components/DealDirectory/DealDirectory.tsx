'use client';

import clsx from 'clsx';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SelectField, TextField } from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateMessage } from '@/components/ui/StateMessage';
import { Wrap } from '@/components/ui/Wrap';
import { DIRECTORY_PAGE_SIZE } from '../../constants';
import { useCategories, useDealFilters, useDealPage } from '../../hooks';
import type { DealSort, ModeFilter } from '../../types';
import { CategoryTabs } from '../CategoryTabs';
import { DealCard } from '../DealCard';
import styles from './DealDirectory.module.css';

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_store', label: 'In store' },
  { value: 'online', label: 'Online' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price', label: 'Regular price' },
];

const SEARCH_DEBOUNCE_MS = 250;

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [text, setText] = useState(value);
  // The last value this box sent. Anything else in the URL came from outside, such as Clear.
  const sent = useRef(value);

  useEffect(() => {
    if (value === sent.current) return;
    sent.current = value;
    setText(value);
  }, [value]);

  useEffect(() => {
    if (text === sent.current) return;
    const timer = setTimeout(() => {
      sent.current = text;
      onChange(text);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, onChange]);

  return (
    <TextField
      bare
      icon={Search}
      type="search"
      label="Search deals"
      placeholder="Search cafés, gyms, textbooks…"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onClear={() => setText('')}
    />
  );
}

export function DealDirectory() {
  const [limit, setLimit] = useState(DIRECTORY_PAGE_SIZE);
  const { filters, setFilters } = useDealFilters(limit);
  const { data, isPending, isError, isFetching, refetch } = useDealPage(filters);
  const { data: categories } = useCategories();

  function changeFilters(next: Parameters<typeof setFilters>[0]) {
    setLimit(DIRECTORY_PAGE_SIZE);
    setFilters(next);
  }

  function clearFilters() {
    changeFilters({ category: 'all', mode: 'all', sort: 'recommended', q: '' });
  }

  const deals = data?.deals ?? [];
  const total = data?.total ?? 0;
  const hasFilters =
    filters.category !== 'all' ||
    filters.mode !== 'all' ||
    filters.sort !== 'recommended' ||
    filters.q !== '';
  const categoryLabel = categories?.find(({ id }) => id === filters.category)?.label;
  const inCategory = filters.category !== 'all' && categoryLabel ? ` in ${categoryLabel}` : '';

  return (
    <main className={styles.page}>
      <Wrap>
        <PageHeader
          title="Student deals"
          description="Verify once, then claim in store or order online."
        />

        <div className={styles.bar}>
          <div className={styles.search}>
            <SearchField value={filters.q} onChange={(q) => changeFilters({ q })} />
          </div>
          <div className={styles.mode}>
            <Segmented
              label="Redemption type"
              value={filters.mode}
              options={MODE_OPTIONS}
              onChange={(mode) => changeFilters({ mode })}
            />
          </div>
          <SelectField
            bare
            label="Sort by"
            className={styles.sort}
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={(sort) => changeFilters({ sort: sort as DealSort })}
          />
        </div>

        {categories && (
          <CategoryTabs
            categories={categories}
            value={filters.category}
            onChange={(category) => changeFilters({ category })}
          />
        )}

        <div className={styles.summary}>
          <p role="status">
            {isPending ? 'Loading deals…' : `${total} deal${total === 1 ? '' : 's'}${inCategory}`}
          </p>
          {hasFilters && deals.length > 0 && (
            <button type="button" className={styles.clear} onClick={clearFilters}>
              <Icon icon={X} size={15} />
              Clear filters
            </button>
          )}
        </div>

        <div className={styles.results}>
          {isPending && (
            <div className={styles.grid} aria-busy="true">
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className={styles.skeleton} />
              ))}
            </div>
          )}

          {isError && (
            <StateMessage
              role="alert"
              action={
                <Button variant="ghost" size="sm" loading={isFetching} onClick={() => refetch()}>
                  Try again
                </Button>
              }
            >
              We couldn&apos;t load deals just now. Check your connection and try again.
            </StateMessage>
          )}

          {!isPending && !isError && deals.length === 0 && (
            <StateMessage
              action={
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            >
              No deals match that yet. Try clearing your filters.
            </StateMessage>
          )}

          {!isError && deals.length > 0 && (
            <div
              className={clsx(styles.grid, isFetching && styles.refreshing)}
              aria-busy={isFetching}
            >
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}

          {deals.length < total && (
            <div className={styles.more}>
              <Button
                variant="ghost"
                loading={isFetching}
                onClick={() => setLimit(limit + DIRECTORY_PAGE_SIZE)}
              >
                Show more deals
              </Button>
            </div>
          )}
        </div>
      </Wrap>
    </main>
  );
}
