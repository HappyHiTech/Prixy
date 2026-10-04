import { View, Text } from 'react-native';

import { useDeckQuery } from '@/hooks/TanStack/deck/useDeckQuery';

import { styles } from './StatsCard.styles';

type StatsCardProps = {
  variant?: 'light' | 'dark';
};

const StatsCard = ({ variant = 'light' }: StatsCardProps) => {
  const { data: deck } = useDeckQuery();

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
        Today: {deck?.prayedToday ?? 0}
      </Text>
      <Text style={[styles.stat, isDark && styles.statDark]}>
        Deck: {deck?.cards.length ?? 0}
      </Text>
    </View>
  );
};

export default StatsCard;
