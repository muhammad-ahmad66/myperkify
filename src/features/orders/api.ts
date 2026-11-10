import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import type { CheckoutValues } from './schemas';
import type { Order } from './types';

export async function placeOrder(values: CheckoutValues): Promise<{ orderId: string }> {
  const response = await api.post<ApiSuccess<{ orderId: string }>>('/orders', values);
  return response.data.data;
}

export async function fetchOrders(): Promise<Order[]> {
  const response = await api.get<ApiSuccess<Order[]>>('/orders');
  return response.data.data;
}

export async function fetchOrder(id: string): Promise<Order> {
  const response = await api.get<ApiSuccess<Order>>(`/orders/${id}`);
  return response.data.data;
}
