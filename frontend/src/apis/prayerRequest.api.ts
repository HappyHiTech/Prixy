import apiFetch from './apiClient';

import type {
  PrayerRequest,
  PrayerRequestStatus,
  PrayerRequestFrequencyType,
  PrayerRequestFilters,
} from '@/types/prayerRequest';

type UpdatePrayerRequestBody = {
  prayeeId?: string | null;
  categoryId?: string | null;
  requestText?: string;
  frequencyType?: PrayerRequestFrequencyType;
  recurringDays?: string[];
  answered?: boolean;
  repeatOn?: string | null;
};

type CreatePrayerRequestBody = {
  requestText: string;
  prayeeId?: string | null;
  categoryId?: string | null;
  frequencyType?: PrayerRequestFrequencyType;
  recurringDays?: string[];
};

export async function fetchPrayerRequests(
  status?: PrayerRequestStatus,
  filters?: PrayerRequestFilters,
): Promise<PrayerRequest[]> {
  const query = new URLSearchParams();

  if (status) query.set('status', status);
  if (filters?.prayeeId) query.set('prayeeId', filters.prayeeId);
  if (filters?.categoryId) query.set('categoryId', filters.categoryId);

  return apiFetch<PrayerRequest[]>(`/prayers?${query.toString()}`);
}

export async function fetchPrayerRequest(id: string): Promise<PrayerRequest> {
  return apiFetch<PrayerRequest>(`/prayers/${id}`);
}

export async function createPrayerRequest(
  body: CreatePrayerRequestBody,
): Promise<PrayerRequest> {
  return apiFetch<PrayerRequest>('/prayers', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function capturePrayerRequests(
  text: string,
): Promise<PrayerRequest[]> {
  return apiFetch<PrayerRequest[]>('/prayers/capture', {
    method: 'POST',
    body: JSON.stringify({ text }),
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

export async function deletePrayerRequest(id: string): Promise<void> {
  return apiFetch<void>(`/prayers/${id}`, {
    method: 'DELETE',
  });
}
