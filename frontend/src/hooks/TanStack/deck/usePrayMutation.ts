import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { prayPrayerRequest } from '@/apis/deck.api';
import type { Deck, DeckPrayer, PrayAction } from '@/types/deck';

type PrayVariables = {
  id: string;
  action: PrayAction;
};

export const usePrayMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: PrayVariables) =>
      prayPrayerRequest(id, action),

    onMutate: async ({ id }: PrayVariables) => {
      await queryClient.cancelQueries({ queryKey: ['deck'] });

      const card = queryClient
        .getQueryData<Deck>(['deck'])
        ?.cards.find((c) => c.id === id);

      queryClient.setQueryData<Deck>(['deck'], (old) =>
        old && {
          prayedToday: old.prayedToday + 1,
          cards: old.cards.filter((c) => c.id !== id),
        },
      );

      return { card };
    },

    onError: (_err, _variables, context) => {
      const card: DeckPrayer | undefined = context?.card;

      if (card) {
        queryClient.setQueryData<Deck>(['deck'], (old) =>
          old && {
            prayedToday: old.prayedToday - 1,
            cards: [card, ...old.cards],
          },
        );
      }

      Alert.alert(
        "Couldn't save that prayer",
        'Check your connection and try again.',
      );
    },

    onSettled: () => {
      // Deck is not refetched: the server reshuffles it on every fetch.
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
    },
  });
};
