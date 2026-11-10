import { Package, Store, Truck } from 'lucide-react';
import type { ChoiceOption, ComboboxOption } from '@/components/ui/form';

export const REDEMPTION_OPTIONS: ChoiceOption[] = [
  {
    value: 'in_store',
    title: 'In store',
    description: 'Students claim at your counter',
    icon: Store,
  },
  { value: 'online', title: 'Online', description: 'You deliver to students', icon: Truck },
  { value: 'both', title: 'Both', description: 'Counter and delivery', icon: Package },
];

export const CITIES: ComboboxOption[] = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
].map((city) => ({ value: city, label: city }));
