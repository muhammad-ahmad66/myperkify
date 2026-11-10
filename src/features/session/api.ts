import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import type { Viewer } from './types';

export async function fetchViewer(): Promise<Viewer> {
  const response = await api.get<ApiSuccess<Viewer>>('/session');
  return response.data.data;
}
