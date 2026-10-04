import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePrayee } from '@/apis/prayee.api';

export const useDeletePrayeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePrayee(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayees'] });
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['deck'] });
    },
  });
};
