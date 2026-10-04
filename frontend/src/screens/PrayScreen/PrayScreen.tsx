import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';

import StatsCard from '@/features/home/components/StatsCard/StatsCard';
import SwipeDeck from '@/features/pray/components/SwipeDeck/SwipeDeck';
import DeckComplete from '@/features/pray/components/DeckComplete/DeckComplete';
import type { SwipeDecision } from '@/features/pray/components/DeckCard/DeckCard';
import { MOCK_PRAYERS, type MockPrayer } from '@/features/pray/mockPrayers';

import { styles } from './PrayScreen.styles';

const PrayScreen = () => {
  // MOCKUP STATE: the real version would PATCH lastPrayedAt (and schedule
  // the "again" ones for tomorrow) instead of only tracking it locally.
  const [queue, setQueue] = useState<MockPrayer[]>(MOCK_PRAYERS);
  const [prayedCount, setPrayedCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);

  // Tabs keep both screens mounted, so a <StatusBar /> element would fight
  // Home's. Flipping the style on focus/blur keeps it tied to what's visible.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const handleSwiped = (prayer: MockPrayer, decision: SwipeDecision) => {
    setQueue((q) => q.filter((p) => p.id !== prayer.id));
    setPrayedCount((n) => n + 1);

    if (decision === 'again') setAgainCount((n) => n + 1);
  };

  const handleRestart = () => {
    setQueue(MOCK_PRAYERS);
    setPrayedCount(0);
    setAgainCount(0);
  };

  const total = MOCK_PRAYERS.length;
  const isDone = queue.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatsCard
          variant="dark"
          todayCount={prayedCount}
          deckCount={queue.length}
        />
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${(prayedCount / total) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.body}>
        {isDone ? (
          <DeckComplete
            prayedCount={prayedCount}
            againCount={againCount}
            onRestart={handleRestart}
          />
        ) : (
          <SwipeDeck prayers={queue} onSwiped={handleSwiped} />
        )}
      </View>
    </View>
  );
};

export default PrayScreen;
