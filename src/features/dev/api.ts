import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';

export type NetworkMode = 'normal' | 'slow' | 'failing';

export type DevState = {
  verificationCode: string | null;
  pendingClaimId: string | null;
  verificationStatus: string | null;
  network: NetworkMode;
};

export async function fetchDevState(): Promise<DevState> {
  const response = await api.get<ApiSuccess<DevState>>('/dev/state');
  return response.data.data;
}

export type DevViewer = 'visitor' | 'verified' | 'pending' | 'owner' | 'cashier' | 'admin';

export async function devSetViewer(as: DevViewer): Promise<void> {
  await api.post('/dev/viewer', { as });
}

export async function devSetNetwork(mode: NetworkMode): Promise<void> {
  await api.post('/dev/network', { mode });
}

export async function devApproveClaim(id: string): Promise<void> {
  await api.post(`/dev/claims/${id}/approve`);
}

export async function devDecideCard(decision: 'approve' | 'reject'): Promise<void> {
  await api.post('/dev/card-decision', { decision });
}

export async function devReset(): Promise<void> {
  await api.post('/dev/reset');
}
