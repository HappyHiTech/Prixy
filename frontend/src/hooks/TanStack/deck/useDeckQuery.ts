import { useQuery } from '@tanstack/react-query';

import { fetchDeck } from '@/apis/deck.api';

export const useDeckQuery = () => {
  return useQuery({
    queryKey: ['deck'],
    queryFn: fetchDeck,
  });
};
