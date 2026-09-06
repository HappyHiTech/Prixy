import { useQuery } from '@tanstack/react-query';

import { fetchPrayerRequests } from '@/apis/prayerRequest.api';
import type { PrayerRequestStatus } from '@/types/prayerRequest';

export const usePrayerRequests = (status?: PrayerRequestStatus) => {
  return useQuery({
    queryKey: ['prayerRequests', status],
    queryFn: () => fetchPrayerRequests(status),
  });
};
