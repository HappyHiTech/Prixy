import { Pressable, Text } from 'react-native';

import type { Category } from '@/types/category';
import { styles } from './CategorySelector.styles';

type CategorySelectorProp = {
  category?: Category;
  onPress: () => void;
};

const CategorySelector = ({ category, onPress }: CategorySelectorProp) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.categoryText}>
        {category?.name ?? 'Select a category'}
      </Text>
    </Pressable>
  );
};

export default CategorySelector;
