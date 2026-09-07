import { View, Pressable, Text } from 'react-native';

import PrayeeAvatar from '../PrayeeAvatar/PrayeeAvatar';
import CategorySelector from '../CategorySelector/CategorySelector';

import { useHomeStore } from '@/features/home/stores/useHomeStore';
import { getInitials } from '@/utils';

import type { PrayerRequest } from '@/types/prayerRequest';
import { Category } from '@/types/category';

import { styles } from './CompactRequestCard.styles';

type CompactRequestCardProp = {
  prayReq: PrayerRequest;
  prayeeName?: string;
  category?: Category;
};

const CompactRequestcard = ({
  prayReq,
  prayeeName,
  category,
}: CompactRequestCardProp) => {
  const setSelectedPrayerId = useHomeStore((s) => s.setSelectedPrayerId);
  const setSelectedEdit = useHomeStore((s) => s.setSelectedEdit);

  return (
    <Pressable style={styles.container}>
      <View style={styles.leftOfCard}>
        <PrayeeAvatar
          icon={prayeeName ? getInitials(prayeeName) : undefined}
          onPress={() => {
            setSelectedPrayerId(prayReq.id);
            setSelectedEdit('prayee');
          }}
        />
      </View>
      <View style={styles.rightOfCard}>
        <Text style={styles.requestText}>{prayReq.requestText}</Text>
        <CategorySelector
          category={category}
          onPress={() => {
            setSelectedPrayerId(prayReq.id);
            setSelectedEdit('category');
          }}
        />
      </View>
    </Pressable>
  );
};

export default CompactRequestcard;
