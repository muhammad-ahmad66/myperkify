import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import type { AddToCartInput, CartSummary } from './types';

export async function fetchCart(): Promise<CartSummary> {
  const response = await api.get<ApiSuccess<CartSummary>>('/cart');
  return response.data.data;
}

export async function addToCart(input: AddToCartInput): Promise<CartSummary> {
  const response = await api.post<ApiSuccess<CartSummary>>('/cart/items', input);
  return response.data.data;
}

export async function updateCartLine(input: {
  id: string;
  quantity: number;
}): Promise<CartSummary> {
  const { id, quantity } = input;
  const response = await api.patch<ApiSuccess<CartSummary>>(`/cart/items/${id}`, { quantity });
  return response.data.data;
}

export async function removeCartLine(id: string): Promise<CartSummary> {
  const response = await api.delete<ApiSuccess<CartSummary>>(`/cart/items/${id}`);
  return response.data.data;
}
