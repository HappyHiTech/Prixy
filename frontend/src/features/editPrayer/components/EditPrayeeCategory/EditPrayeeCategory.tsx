import { View } from 'react-native';

import EditPrayee from './EditPrayee/EditPrayee';
import EditCategory from './EditCategory/EditCategory';

import type { Prayee } from '@/types/prayee';
import type { Category } from '@/types/category';

import { styles } from './EditPrayeeCategory.styles';

type EditPrayeeCategoryProp = {
  prayee?: Prayee;
  category?: Category;
};

const EditPrayeeCategory = ({ prayee, category }: EditPrayeeCategoryProp) => {
  return (
    <View style={styles.container}>
      <EditPrayee prayee={prayee} />
      <EditCategory category={category} />
    </View>
  );
};

export default EditPrayeeCategory;
