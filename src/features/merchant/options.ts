import type { SelectOption } from '@/components/ui/form';
import { formatTimeOfDay } from '@/lib/format';

const STEP_MINUTES = 30;
const MINUTES_IN_DAY = 24 * 60;

/** Every half hour of the day, stored as 24-hour text such as "13:30". */
export const TIME_SLOTS: SelectOption[] = Array.from(
  { length: MINUTES_IN_DAY / STEP_MINUTES },
  (_, index) => {
    const minutes = index * STEP_MINUTES;
    const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
    const value = `${hour}:${String(minutes % 60).padStart(2, '0')}`;
    return { value, label: formatTimeOfDay(value) };
  },
);
