import { View, Text } from 'react-native';

import { usePrayerRequests } from '@/hooks/TanStack/prayerRequest/usePrayerRequestQuery';

import { styles } from './StatsCard.styles';

const StatsCard = () => {
  const { data: activeReps } = usePrayerRequests('active');

  return (
    <View style={styles.container}>
      <Text style={[styles.stat, styles.first]}>Today: 0</Text>
      <Text style={styles.stat}>Deck: {activeReps?.length ?? 0}</Text>
    </View>
  );
};

export default StatsCard;
