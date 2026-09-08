import { View, Text } from 'react-native';

import CategoryAvatar from '@/components/CategoryAvatar/CategoryAvatar';

import { styles } from './EditCategory.styles';

const EditCategory = () => {
  return (
    <View style={styles.container}>
      <CategoryAvatar size={44} />
      <Text style={styles.text}>category</Text>
    </View>
  );
};

export default EditCategory;
