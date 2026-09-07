import { View, Pressable, Text } from 'react-native';

import PrayeeAvatar from '../PrayeeAvatar/PrayeeAvatar';
import CategorySelector from '../CategorySelector/CategorySelector';

import { useHomeStore } from '@/features/home/stores/useHomeStore';
import { getInitials } from '@/utils';

import type { PrayerRequest } from '@/types/prayerRequest';
import { styles } from './CompactRequestCard.styles';

type CompactRequestCardProp = {
  prayReq: PrayerRequest;
  prayeeName?: string;
};

const CompactRequestcard = ({
  prayReq,
  prayeeName,
}: CompactRequestCardProp) => {
  const setSelectedPrayerId = useHomeStore((s) => s.setSelectedPrayerId);

  return (
    <Pressable style={styles.container}>
      <View style={styles.leftOfCard}>
        <PrayeeAvatar
          icon={prayeeName ? getInitials(prayeeName) : undefined}
          onPress={() => setSelectedPrayerId(prayReq.id)}
        />
      </View>
      <View style={styles.rightOfCard}>
        <Text style={styles.requestText}>{prayReq.requestText}</Text>
        <CategorySelector />
      </View>
    </Pressable>
  );
};

export default CompactRequestcard;
