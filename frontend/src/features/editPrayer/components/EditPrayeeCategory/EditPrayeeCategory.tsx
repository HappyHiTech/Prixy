import { View } from 'react-native';

import EditPrayee from './EditPrayee/EditPrayee';
import EditCategory from './EditCategory/EditCategory';

import { useEditPrayerDraftStore } from '../../stores/useEditPrayerDraftStore';

import { usePrayeeQuery } from '@/hooks/TanStack/prayee/usePrayeesQuery';
import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';

import { styles } from './EditPrayeeCategory.styles';

const EditPrayeeCategory = () => {
  const prayeeId = useEditPrayerDraftStore((s) => s.prayeeId);
  const categoryId = useEditPrayerDraftStore((s) => s.categoryId);

  const { data: prayees } = usePrayeeQuery();
  const { data: categories } = useCategoriesQuery();

  const prayee = prayees?.find((p) => p.id === prayeeId);
  const category = categories?.find((c) => c.id === categoryId);
  return (
    <View style={styles.container}>
      <EditPrayee prayee={prayee} />
      <EditCategory category={category} />
    </View>
  );
};

export default EditPrayeeCategory;
