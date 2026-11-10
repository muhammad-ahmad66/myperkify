import 'server-only';
import { serverGet } from '@/lib/api/server';
import type { Store } from './types';

export function getStore(slug: string): Promise<Store> {
  return serverGet<Store>(`/stores/${encodeURIComponent(slug)}`);
}
