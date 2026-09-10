import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPrayee } from '@/apis/prayee.api';

export const useCreatePrayeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrayee,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayees'] });
    },
  });
};
