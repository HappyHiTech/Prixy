import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteCategory } from '@/apis/category.api';

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
    },
  });
};
