import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePrayerRequest } from '@/apis/prayerRequest.api';

export const useDeletePrayerRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePrayerRequest(id),

    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['prayerRequest', id] });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
    },
  });
};
