import { useRouter } from 'expo-router';
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

  const router = useRouter();

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        router.push({
          pathname: '/edit-prayer',
          params: { id: prayReq.id },
        });
      }}
    >
      <View style={styles.leftOfCard}>
        <View onStartShouldSetResponder={() => true}>
          <PrayeeAvatar
            icon={prayeeName ? getInitials(prayeeName) : undefined}
            onPress={() => {
              setSelectedPrayerId(prayReq.id);
              setSelectedEdit('prayee');
            }}
          />
        </View>
      </View>
      <View style={styles.rightOfCard}>
        <Text style={styles.requestText}>{prayReq.requestText}</Text>
        <View onStartShouldSetResponder={() => true}>
          <CategorySelector
            category={category}
            onPress={() => {
              setSelectedPrayerId(prayReq.id);
              setSelectedEdit('category');
            }}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default CompactRequestcard;
