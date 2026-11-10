import type { Viewer } from '@/features/session/types';
import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';

export async function requestSignIn(email: string): Promise<void> {
  await api.post('/auth/sign-in', { email });
}

export async function confirmSignIn(input: { email: string; code: string }): Promise<Viewer> {
  const response = await api.post<ApiSuccess<Viewer>>('/auth/confirm', input);
  return response.data.data;
}

export async function signOut(): Promise<void> {
  await api.post('/auth/sign-out');
}
