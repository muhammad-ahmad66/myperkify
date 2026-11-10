import { API_BASE_URL } from '@/lib/api/config';

/** A plain link: the browser downloads the PDF with the session cookie. */
export function receiptUrl(orderId: string): string {
  return `${API_BASE_URL}/orders/${orderId}/receipt`;
}
