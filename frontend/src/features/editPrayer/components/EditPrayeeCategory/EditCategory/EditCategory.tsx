import { Pressable, Text } from 'react-native';

import CategoryAvatar from '@/components/CategoryAvatar/CategoryAvatar';

import { useEditPrayerStore } from '@/features/editPrayer/stores/useEditPrayerStore';

import type { Category } from '@/types/category';

import { styles } from './EditCategory.styles';

type EditCategoryProp = {
  category?: Category;
};

const EditCategory = ({ category }: EditCategoryProp) => {
  const setSelectedEdit = useEditPrayerStore((s) => s.setSelectedEdit);

  return (
    <Pressable
      style={styles.container}
      onPress={() => setSelectedEdit('category')}
    >
      <CategoryAvatar size={44} icon={category?.icon} />
      <Text style={styles.text} numberOfLines={2}>
        {category?.name ?? 'Select a category'}
      </Text>
    </Pressable>
  );
};

export default EditCategory;
