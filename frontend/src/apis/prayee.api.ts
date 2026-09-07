import apiFetch from './apiClient';

import type { Prayee } from '@/types/prayee';

export async function fetchPrayee(): Promise<Prayee[]> {
  return apiFetch<Prayee[]>(`/prayees`);
}
