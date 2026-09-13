import { useQuery } from '@tanstack/react-query';

import { fetchPrayerRequests } from '@/apis/prayerRequest.api';
import type {
  PrayerRequestStatus,
  PrayerRequestFilters,
} from '@/types/prayerRequest';

export const usePrayerRequests = (
  status?: PrayerRequestStatus,
  filters?: PrayerRequestFilters,
) => {
  return useQuery({
    queryKey: [
      'prayerRequests',
      status ?? null,
      filters?.prayeeId ?? null,
      filters?.categoryId ?? null,
    ],
    queryFn: () => fetchPrayerRequests(status, filters),
  });
};
