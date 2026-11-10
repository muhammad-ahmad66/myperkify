export { formatPKR } from './money';
export { formatClock, formatTimer } from './time';

/** "13:30" becomes "1:30 pm". */
export function formatTimeOfDay(time: string): string {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const period = hours < 12 ? 'am' : 'pm';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`;
}
