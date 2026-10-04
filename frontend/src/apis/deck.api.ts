import apiFetch from './apiClient';

import { getTimeZone } from '@/utils';
import type { Deck, PrayAction } from '@/types/deck';
import type { PrayerRequest } from '@/types/prayerRequest';

export async function fetchDeck(): Promise<Deck> {
  const query = new URLSearchParams({ tz: getTimeZone() });

  return apiFetch<Deck>(`/deck?${query.toString()}`);
}

export async function prayPrayerRequest(
  id: string,
  action: PrayAction,
): Promise<PrayerRequest> {
  return apiFetch<PrayerRequest>(`/prayers/${id}/pray`, {
    method: 'POST',
    body: JSON.stringify({ action, tz: getTimeZone() }),
  });
}
