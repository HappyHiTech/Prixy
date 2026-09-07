import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePrayerRequest } from '@/apis/prayerRequest.api';
import type { PrayerRequest } from '@/types/prayerRequest';

type UpdatePrayerRequestVariables = {
  id: string;
  prayeeId: string | null;
};

export const useUpdatePrayerRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: UpdatePrayerRequestVariables) =>
      updatePrayerRequest(id, updates),

    onSuccess: (updated: PrayerRequest) => {
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
      queryClient.setQueryData(['prayerRequest', updated.id], updated);
    },
  });
};
