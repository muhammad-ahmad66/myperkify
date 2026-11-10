'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { categoryIcon } from '../../categoryIcons';
import type { Category } from '../../types';
import styles from './CategoryTabs.module.css';

type CategoryTabsProps = {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
};

export function CategoryTabs({ categories, value, onChange }: CategoryTabsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // On a narrow screen the row scrolls, so bring the chosen category into view.
  useEffect(() => {
    const row = rowRef.current;
    const tab = selectedRef.current;
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    const left = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2;
    row.scrollTo({ left, behavior: 'smooth' });
  }, [value]);

  return (
    <div ref={rowRef} className={styles.row} role="group" aria-label="Categories">
      {categories.map((category) => {
        const selected = category.id === value;
        return (
          <button
            key={category.id}
            ref={selected ? selectedRef : undefined}
            type="button"
            className={styles.tab}
            aria-pressed={selected}
            onClick={() => onChange(category.id)}
          >
            <span className={styles.tile}>
              <Icon icon={categoryIcon(category.id)} size={21} />
            </span>
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
