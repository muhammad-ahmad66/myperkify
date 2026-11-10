import { z } from 'zod';
import type { Viewer } from '@/features/session/types';
import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import { universitySchema } from './schemas';
import type { AccountValues, University } from './types';

export async function fetchUniversities(): Promise<University[]> {
  const response = await api.get<ApiSuccess<unknown>>('/universities');
  return z.array(universitySchema).parse(response.data.data);
}

export async function createAccount(values: AccountValues): Promise<Viewer> {
  const response = await api.post<ApiSuccess<Viewer>>('/verification/account', values);
  return response.data.data;
}

export async function verifyCode(code: string): Promise<Viewer> {
  const response = await api.post<ApiSuccess<Viewer>>('/verification/code', { code });
  return response.data.data;
}

export async function resendCode(): Promise<void> {
  await api.post('/verification/code/resend');
}

export async function uploadCard(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<Viewer> {
  const body = new FormData();
  body.append('card', file);
  const response = await api.post<ApiSuccess<Viewer>>('/verification/card', body, {
    onUploadProgress: ({ progress }) => {
      if (progress !== undefined) onProgress?.(Math.round(progress * 100));
    },
  });
  return response.data.data;
}
