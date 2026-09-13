import { Pressable, Text } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { usePrayeeQuery } from '@/hooks/TanStack/prayee/usePrayeesQuery';
import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';
import { useGalleryStore } from '../../stores/useGalleryStore';

import { COLORS } from '@/constants';

import type { FilterType } from '../../GalleryFilterSheet/GalleryFilterSheet';
import { styles } from './FilterBox.styles';

const STATUS_LABELS: Record<string, string> = {
  inbox: 'Inbox',
  active: 'Active',
  answered: 'Answered',
};

type FilterBoxProp = {
  type: FilterType;
  onPress: () => void;
};

const FilterBox = ({ type, onPress }: FilterBoxProp) => {
  const prayeeId = useGalleryStore((s) => s.prayeeId);
  const categoryId = useGalleryStore((s) => s.categoryId);
  const status = useGalleryStore((s) => s.status);

  const { data: prayees } = usePrayeeQuery();
  const { data: categories } = useCategoriesQuery();

  const label =
    type === 'Prayee'
      ? prayees?.find((p) => p.id === prayeeId)?.name
      : type === 'Category'
        ? categories?.find((c) => c.id === categoryId)?.name
        : status
          ? STATUS_LABELS[status]
          : undefined;

  // A filter with no selection falls back to showing its own type name.
  const isActive = label !== undefined;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text
        style={[styles.text, isActive && styles.textActive]}
        numberOfLines={1}
      >
        {label ?? type}
      </Text>
      <ChevronDown size={16} color={isActive ? COLORS.accent : '#999999'} />
    </Pressable>
  );
};

export default FilterBox;
