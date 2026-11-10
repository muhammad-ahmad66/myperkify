import type { BadgeTone } from '@/components/ui/StatusBadge';
import type { OrderStatus, PaymentMethod } from './types';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash_counter: 'Cash at counter',
  cod: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
};

export const ORDER_STATUS: Record<OrderStatus, [BadgeTone, string]> = {
  placed: ['waiting', 'Placed'],
  processing: ['waiting', 'Preparing'],
  dispatched: ['waiting', 'Dispatched'],
  completed: ['success', 'Delivered'],
  cancelled: ['danger', 'Cancelled'],
};
