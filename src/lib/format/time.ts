import { format } from 'date-fns';

/** Countdown display, for example 4:12. */
export function formatTimer(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Clock display in the UI, for example 1:00 am. */
export function formatClock(date: Date | string): string {
  return format(new Date(date), 'h:mm aaa');
}
