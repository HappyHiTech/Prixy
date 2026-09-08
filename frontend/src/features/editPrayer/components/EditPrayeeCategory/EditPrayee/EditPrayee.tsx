import { View, Text } from 'react-native';

import PrayeeAvatar from '@/components/PrayeeAvatar/PrayeeAvatar';

import { styles } from './EditPrayee.styles';

const EditPrayee = () => {
  return (
    <View style={styles.container}>
      <PrayeeAvatar size={44} />
      <Text style={styles.text}>Harvey Tan</Text>
    </View>
  );
};

export default EditPrayee;
