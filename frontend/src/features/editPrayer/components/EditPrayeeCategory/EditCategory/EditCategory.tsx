import { Pressable, Text } from 'react-native';

import CategoryAvatar from '@/components/CategoryAvatar/CategoryAvatar';

import { useEditPrayerStore } from '@/features/editPrayer/stores/useEditPrayerStore';
import { styles } from './EditCategory.styles';

const EditCategory = () => {
  const setSelectedEdit = useEditPrayerStore((s) => s.setSelectedEdit);

  return (
    <Pressable
      style={styles.container}
      onPress={() => setSelectedEdit('category')}
    >
      <CategoryAvatar size={44} />
      <Text style={styles.text}>category</Text>
    </Pressable>
  );
};

export default EditCategory;
