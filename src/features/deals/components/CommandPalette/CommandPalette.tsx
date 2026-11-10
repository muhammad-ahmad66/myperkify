'use client';

import { CornerDownLeft, ChevronsUpDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { BrandTile } from '@/components/ui/BrandTile';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { useUiStore } from '@/stores/uiStore';
import { useDealSearch } from '../../hooks';
import styles from './CommandPalette.module.css';

const SEARCH_DEBOUNCE_MS = 150;

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(target.tagName);
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const listId = useId();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const {
    data: results = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useDealSearch(query, true);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const active = Math.min(selected, Math.max(0, results.length - 1));

  function open(index: number) {
    const deal = results[index];
    if (!deal) return;
    onClose();
    router.push(ROUTES.deal(deal.slug));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelected(Math.min(results.length - 1, active + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelected(Math.max(0, active - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      open(active);
    }
  }

  return (
    <>
      <div className={styles.inputRow}>
        <Icon icon={Search} size={24} />
        <input
          className={styles.input}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setSelected(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search brands, deals or categories"
          aria-label="Search brands, deals or categories"
          autoComplete="off"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
        />
        <span className={styles.kbd}>Esc</span>
      </div>

      <div className={styles.list} id={listId} role="listbox" aria-label="Deals">
        {results.length > 0 && (
          <div className={styles.group}>
            {query
              ? `${results.length} result${results.length > 1 ? 's' : ''}`
              : 'Popular near you'}
          </div>
        )}
        {results.map((deal, index) => (
          <button
            key={deal.id}
            id={`${listId}-${index}`}
            type="button"
            role="option"
            tabIndex={-1}
            className={styles.item}
            aria-selected={index === active}
            onMouseEnter={() => setSelected(index)}
            onClick={() => open(index)}
          >
            <BrandTile initials={deal.brand.initials} color={deal.brand.color} size="sm" />
            <span className={styles.itemText}>
              <b>{deal.brand.name}</b>
              <small>
                {deal.title} · {deal.categoryLabel}
              </small>
            </span>
            <span className={styles.offer}>{deal.stamp.offer}</span>
          </button>
        ))}
        {isPending && (
          <p className={styles.empty} role="status">
            Searching…
          </p>
        )}
        {isError && (
          <div className={styles.empty} role="alert">
            <p>We couldn&apos;t search just now.</p>
            <Button
              variant="ghost"
              size="sm"
              loading={isFetching}
              className={styles.retry}
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        )}
        {!isPending && !isError && results.length === 0 && (
          <p className={styles.empty} role="status">
            No deals for &ldquo;{text}&rdquo; yet. Try a category like food or books.
          </p>
        )}
      </div>

      <div className={styles.footer}>
        <span>
          <Icon icon={ChevronsUpDown} size={16} />
          Move
        </span>
        <span>
          <Icon icon={CornerDownLeft} size={16} />
          Open
        </span>
      </div>
    </>
  );
}

export function CommandPalette() {
  const open = useUiStore((state) => state.searchOpen);
  const setOpen = useUiStore((state) => state.setSearchOpen);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isShortcut) {
        event.preventDefault();
        setOpen(!useUiStore.getState().searchOpen);
      } else if (event.key === '/' && !isTypingTarget(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent placement="top" className={styles.box} aria-describedby={undefined}>
        <DialogTitle className={styles.srOnly}>Search deals</DialogTitle>
        <PaletteBody onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
