import apiFetch from './apiClient';

import type { PrayerRequest, PrayerRequestStatus } from '@/types/prayerRequest';

export async function fetchPrayerRequests(
  status?: PrayerRequestStatus,
): Promise<PrayerRequest[]> {
  const query = new URLSearchParams();

  if (status) query.set('status', status);

  return apiFetch<PrayerRequest[]>(`/prayers?${query.toString()}`);
}

export async function fetchPrayerRequest(id: string): Promise<PrayerRequest> {
  return apiFetch<PrayerRequest>(`/prayers/${id}`);
}

type UpdatePrayerRequestBody = {
  prayeeId?: string | null;
  categoryId?: string | null;
};

export async function createPrayerRequest(): Promise<PrayerRequest> {
  return apiFetch<PrayerRequest>('/prayers', {
    method: 'POST',
  });
}

export async function updatePrayerRequest(
  id: string,
  updates: UpdatePrayerRequestBody,
): Promise<PrayerRequest> {
  return apiFetch<PrayerRequest>(`/prayers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}
