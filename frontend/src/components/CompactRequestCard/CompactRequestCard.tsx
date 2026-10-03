import { useRouter } from 'expo-router';
import { View, Pressable, Text } from 'react-native';

import PrayeeAvatar from '../PrayeeAvatar/PrayeeAvatar';
import CategorySelector from '../CategorySelector/CategorySelector';

import { getInitials } from '@/utils';

import type { PrayerRequest } from '@/types/prayerRequest';
import type { EditTarget } from '@/features/editPrayer/stores/useEditPrayerStore';
import { Category } from '@/types/category';

import { styles } from './CompactRequestCard.styles';

type CompactRequestCardProp = {
  prayReq: PrayerRequest;
  prayeeName?: string;
  category?: Category;
  onEditField: (prayerId: string, field: EditTarget) => void;
};

const CompactRequestcard = ({
  prayReq,
  prayeeName,
  category,
  onEditField,
}: CompactRequestCardProp) => {
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
            onPress={() => onEditField(prayReq.id, 'prayee')}
          />
        </View>
      </View>
      <View style={styles.rightOfCard}>
        <Text style={styles.requestText}>{prayReq.requestText}</Text>
        <View onStartShouldSetResponder={() => true}>
          <CategorySelector
            category={category}
            onPress={() => onEditField(prayReq.id, 'category')}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default CompactRequestcard;
