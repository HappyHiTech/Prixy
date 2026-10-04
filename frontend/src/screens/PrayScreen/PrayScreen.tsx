import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DARK_COLORS, DURATION, EASE } from '@/constants';
import StatsCard from '@/features/home/components/StatsCard/StatsCard';
import SwipeDeck from '@/features/pray/components/SwipeDeck/SwipeDeck';
import DeckComplete from '@/features/pray/components/DeckComplete/DeckComplete';
import type { SwipeDecision } from '@/features/pray/components/DeckCard/DeckCard';
import { useDeckQuery } from '@/hooks/TanStack/deck/useDeckQuery';
import { usePrayMutation } from '@/hooks/TanStack/deck/usePrayMutation';
import type { DeckPrayer } from '@/types/deck';

import { styles } from './PrayScreen.styles';

const todayKey = () => new Date().toDateString();

const PrayScreen = () => {
  const { data: deck, isError, refetch } = useDeckQuery();
  const { mutateAsync: pray } = usePrayMutation();

  const [again, setAgain] = useState({ day: todayKey(), count: 0 });
  const againCount = again.day === todayKey() ? again.count : 0;

  const hasFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      if (hasFocused.current) refetch();
      hasFocused.current = true;
      return () => setStatusBarStyle('dark');
    }, [refetch]),
  );

  const handleSwiped = (prayer: DeckPrayer, decision: SwipeDecision) => {
    // Not mutate's per-call onSuccess: it only fires for the latest call.
    pray({
      id: prayer.id,
      action: decision === 'prayed' ? 'done' : 'repeat_tomorrow',
    })
      .then(() => {
        if (decision !== 'again') return;
        const day = todayKey();
        setAgain((prev) => ({
          day,
          count: prev.day === day ? prev.count + 1 : 1,
        }));
      })
      // usePrayMutation's onError handles failures.
      .catch(() => {});
  };

  const prayedToday = deck?.prayedToday ?? 0;
  const total = prayedToday + (deck?.cards.length ?? 0);
  const progress = total === 0 ? 0 : prayedToday / total;

  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.set(
      withTiming(progress, { duration: DURATION.fast, easing: EASE.inOut }),
    );
  }, [progress, animatedProgress]);

  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

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
        <Animated.View style={[styles.progressFill, progressFillStyle]} />
      </View>

      <View style={styles.body}>{renderBody()}</View>
    </View>
  );
};

export default PrayScreen;
