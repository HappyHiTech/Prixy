import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePrayerRequest } from '@/apis/prayerRequest.api';
import type { PrayerRequest } from '@/types/prayerRequest';

type UpdatePrayerRequestVariables = {
  id: string;
  answered?: boolean;
} & Partial<
  Pick<
    PrayerRequest,
    | 'prayeeId'
    | 'categoryId'
    | 'requestText'
    | 'frequencyType'
    | 'recurringDays'
  >
>;

export const useUpdatePrayerRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: UpdatePrayerRequestVariables) =>
      updatePrayerRequest(id, updates),

 
    onMutate: async ({
      id,
      answered,
      ...updates
    }: UpdatePrayerRequestVariables) => {
      const key = ['prayerRequest', id];

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<PrayerRequest>(key);

      if (previous) {
        const next: PrayerRequest = { ...previous, ...updates };


        if (answered !== undefined) {
          next.status = answered
            ? 'answered'
            : next.prayeeId && next.categoryId
              ? 'active'
              : 'inbox';
          next.answeredAt = answered ? new Date().toISOString() : null;
        }

        queryClient.setQueryData<PrayerRequest>(key, next);
      }

      return { key, previous };
    },

    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },

    onSuccess: (updated: PrayerRequest) => {
      queryClient.setQueryData(['prayerRequest', updated.id], updated);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
    },
  });
};
