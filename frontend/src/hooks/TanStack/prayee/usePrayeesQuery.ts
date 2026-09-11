import { useQuery } from '@tanstack/react-query';

import { fetchPrayee } from '@/apis/prayee.api';

export const usePrayeeQuery = () => {
  return useQuery({
    queryKey: [`prayees`],
    queryFn: fetchPrayee,
  });
};
