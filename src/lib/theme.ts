export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'mp_theme';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Light unless the visitor chose dark. The device setting is ignored on purpose. */
export function parseTheme(value: string | undefined): Theme {
  return value === 'dark' ? 'dark' : 'light';
}

const listeners = new Set<() => void>();

export function subscribeToTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function currentTheme(): Theme {
  return parseTheme(document.documentElement.dataset.theme);
}

/** A cookie, so the server renders the chosen theme and the page never flashes the wrong one. */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  listeners.forEach((listener) => listener());
}
