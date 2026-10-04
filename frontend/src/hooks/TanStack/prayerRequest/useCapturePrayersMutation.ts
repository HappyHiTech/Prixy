import { useMutation, useQueryClient } from '@tanstack/react-query';

import { capturePrayerRequests } from '@/apis/prayerRequest.api';

export const useCapturePrayersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: capturePrayerRequests,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['deck'] });
    },
  });
};
