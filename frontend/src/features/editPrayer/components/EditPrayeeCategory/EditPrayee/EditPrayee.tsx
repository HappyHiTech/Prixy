import { Pressable, Text } from 'react-native';

import PrayeeAvatar from '@/components/PrayeeAvatar/PrayeeAvatar';

import { useEditPrayerStore } from '@/features/editPrayer/stores/useEditPrayerStore';
import { styles } from './EditPrayee.styles';

const EditPrayee = () => {
  const setSelectedEdit = useEditPrayerStore((s) => s.setSelectedEdit);

  return (
    <Pressable style={styles.container} onPress={() => setSelectedEdit('prayee')}>
      <PrayeeAvatar size={44} />
      <Text style={styles.text}>Harvey Tan</Text>
    </Pressable>
  );
};

export default EditPrayee;
