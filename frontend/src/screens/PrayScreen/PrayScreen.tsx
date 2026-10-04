import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';

import { DARK_COLORS } from '@/constants';
import StatsCard from '@/features/home/components/StatsCard/StatsCard';
import SwipeDeck from '@/features/pray/components/SwipeDeck/SwipeDeck';
import DeckComplete from '@/features/pray/components/DeckComplete/DeckComplete';
import type { SwipeDecision } from '@/features/pray/components/DeckCard/DeckCard';
import { useDeckQuery } from '@/hooks/TanStack/deck/useDeckQuery';
import { usePrayMutation } from '@/hooks/TanStack/deck/usePrayMutation';
import type { DeckPrayer } from '@/types/deck';

import { styles } from './PrayScreen.styles';

const PrayScreen = () => {
  const { data: deck, isError, refetch } = useDeckQuery();
  const { mutate: pray } = usePrayMutation();

  const [againCount, setAgainCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      refetch();
      return () => setStatusBarStyle('dark');
    }, [refetch]),
  );

  const handleSwiped = (prayer: DeckPrayer, decision: SwipeDecision) => {
    pray({
      id: prayer.id,
      action: decision === 'prayed' ? 'done' : 'repeat_tomorrow',
    });

    if (decision === 'again') setAgainCount((n) => n + 1);
  };

  const prayedToday = deck?.prayedToday ?? 0;
  const total = prayedToday + (deck?.cards.length ?? 0);
  const progress = total === 0 ? 0 : prayedToday / total;

  const renderBody = () => {
    if (!deck) {
      return isError ? (
        <View style={styles.message}>
          <Text style={styles.messageText}>
            {"Couldn't load today's deck."}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ActivityIndicator color={DARK_COLORS.mutedText} />
      );
    }

    if (deck.cards.length === 0) {
      return (
        <DeckComplete prayedCount={deck.prayedToday} againCount={againCount} />
      );
    }

    return <SwipeDeck prayers={deck.cards} onSwiped={handleSwiped} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatsCard variant="dark" />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.body}>{renderBody()}</View>
    </View>
  );
};

export default PrayScreen;
