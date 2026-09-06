import apiFetch from './apiClient';

import type { PrayerRequest, PrayerRequestStatus } from '@/types/prayerRequest';

export async function fetchPrayerRequests(
  status?: PrayerRequestStatus,
): Promise<PrayerRequest[]> {
  const query = new URLSearchParams();

  if (status) query.set('status', status);

  return apiFetch<PrayerRequest[]>(`/prayers?${query.toString()}`);
}
