import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/apis/apiClient';
import { prayPrayerRequest } from '@/apis/deck.api';
import type { Deck, DeckPrayer, PrayAction } from '@/types/deck';
import type { PrayerRequest } from '@/types/prayerRequest';

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

      if (card) {
        queryClient.setQueryData<Deck>(
          ['deck'],
          (old) =>
            old && {
              prayedToday: old.prayedToday + 1,
              cards: old.cards.filter((c) => c.id !== id),
            },
        );
      }

      return { card };
    },

    onSuccess: (updated: PrayerRequest) => {
      queryClient.setQueryData(['prayerRequest', updated.id], updated);
    },

    onError: (err, _variables, context) => {
      if (
        err instanceof ApiError &&
        (err.status === 404 || err.status === 409)
      ) {
        queryClient.invalidateQueries({ queryKey: ['deck'] });
        Alert.alert(
          'This request changed',
          'It was updated on another screen, so your deck has been refreshed.',
        );
        return;
      }

      const card: DeckPrayer | undefined = context?.card;

      if (card) {
        queryClient.setQueryData<Deck>(['deck'], (old) =>
          old && !old.cards.some((c) => c.id === card.id)
            ? {
                prayedToday: Math.max(0, old.prayedToday - 1),
                cards: [card, ...old.cards],
              }
            : old,
        );
      }

      Alert.alert(
        "Couldn't save that prayer",
        'Check your connection and try again.',
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
    },
  });
};
