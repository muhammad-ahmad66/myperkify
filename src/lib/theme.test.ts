import { describe, expect, it } from 'vitest';
import { currentTheme, parseTheme, setTheme } from './theme';

describe('theme', () => {
  it('defaults to light', () => {
    expect(parseTheme(undefined)).toBe('light');
    expect(parseTheme('anything')).toBe('light');
  });

  it('applies a choice to the page and remembers it', () => {
    setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(currentTheme()).toBe('dark');
    expect(document.cookie).toContain('mp_theme=dark');
    setTheme('light');
    expect(currentTheme()).toBe('light');
  });
});
