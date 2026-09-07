import { useQuery } from '@tanstack/react-query';

import { fetchCategories } from '@/apis/category.api';

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
};
