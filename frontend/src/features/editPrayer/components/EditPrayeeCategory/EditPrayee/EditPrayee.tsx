import { Pressable, Text } from 'react-native';

import PrayeeAvatar from '@/components/PrayeeAvatar/PrayeeAvatar';

import { useEditPrayerStore } from '@/features/editPrayer/stores/useEditPrayerStore';
import { getInitials } from '@/utils';

import type { Prayee } from '@/types/prayee';

import { styles } from './EditPrayee.styles';

type EditPrayeeProp = {
  prayee?: Prayee;
};

const EditPrayee = ({ prayee }: EditPrayeeProp) => {
  const setSelectedEdit = useEditPrayerStore((s) => s.setSelectedEdit);

  return (
    <Pressable
      style={styles.container}
      onPress={() => setSelectedEdit('prayee')}
    >
      <PrayeeAvatar
        size={44}
        icon={prayee ? getInitials(prayee.name) : undefined}
      />
      <Text style={styles.text} numberOfLines={2}>
        {prayee?.name ?? 'Select a name'}
      </Text>
    </Pressable>
  );
};

export default EditPrayee;
