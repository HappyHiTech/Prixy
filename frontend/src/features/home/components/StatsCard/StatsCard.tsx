import { View, Text } from 'react-native';

import { usePrayerRequests } from '@/hooks/TanStack/prayerRequest/usePrayerRequestQuery';

import { styles } from './StatsCard.styles';

type StatsCardProps = {
  variant?: 'light' | 'dark';
  // MOCKUP: pray mode passes its local counts until it reads real data.
  todayCount?: number;
  deckCount?: number;
};

const StatsCard = ({
  variant = 'light',
  todayCount,
  deckCount,
}: StatsCardProps) => {
  const { data: activeReps } = usePrayerRequests('active');

  const isDark = variant === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text
        style={[
          styles.stat,
          styles.first,
          isDark && styles.statDark,
          isDark && styles.firstDark,
        ]}
      >
        Today: {todayCount ?? 0}
      </Text>
      <Text style={[styles.stat, isDark && styles.statDark]}>
        Deck: {deckCount ?? activeReps?.length ?? 0}
      </Text>
    </View>
  );
};

export default StatsCard;
