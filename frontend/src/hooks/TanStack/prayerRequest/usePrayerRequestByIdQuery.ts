import { useQuery } from '@tanstack/react-query';

import { fetchPrayerRequest } from '@/apis/prayerRequest.api';

export const usePrayerRequestByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['prayerRequest', id],
    queryFn: () => fetchPrayerRequest(id),
    enabled: Boolean(id),
  });
};
