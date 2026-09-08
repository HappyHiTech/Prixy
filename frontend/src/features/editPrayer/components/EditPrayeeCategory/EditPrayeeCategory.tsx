import { View } from 'react-native';

import EditPrayee from './EditPrayee/EditPrayee';
import EditCategory from './EditCategory/EditCategory';

import { styles } from './EditPrayeeCategory.styles';

const EditPrayeeCategory = () => {
  return (
    <View style={styles.container}>
      <EditPrayee />
      <EditCategory />
    </View>
  );
};

export default EditPrayeeCategory;
