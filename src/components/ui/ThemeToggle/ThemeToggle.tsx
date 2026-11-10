'use client';

import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { currentTheme, setTheme, subscribeToTheme, type Theme } from '@/lib/theme';
import { Icon } from '../Icon';
import styles from './ThemeToggle.module.css';

const serverTheme = (): Theme => 'light';

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeToTheme, currentTheme, serverTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={className ?? styles.toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Icon icon={isDark ? Sun : Moon} />
    </button>
  );
}
