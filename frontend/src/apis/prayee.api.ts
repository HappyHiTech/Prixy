import apiFetch from './apiClient';

import type { Prayee } from '@/types/prayee';

export async function fetchPrayee(): Promise<Prayee[]> {
  return apiFetch<Prayee[]>(`/prayees`);
}

export async function createPrayee(input: { name: string }): Promise<Prayee> {
  return apiFetch<Prayee>(`/prayees`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
