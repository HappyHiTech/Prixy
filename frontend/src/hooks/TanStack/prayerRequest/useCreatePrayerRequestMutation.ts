import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPrayerRequest } from '@/apis/prayerRequest.api';
import type { PrayerRequest } from '@/types/prayerRequest';

export const useCreatePrayerRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrayerRequest,

    onSuccess: (created: PrayerRequest) => {
      console.log('[dbg] created', created.id, created.status);
      queryClient.invalidateQueries({ queryKey: [`prayerRequests`] });
      queryClient.invalidateQueries({ queryKey: ['deck'] });
      queryClient.setQueryData(['prayerRequest', created.id], created);
    },
  });
};
