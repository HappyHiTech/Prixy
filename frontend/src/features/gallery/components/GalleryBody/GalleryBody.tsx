import { View, Text } from 'react-native';

import { styles } from './GalleryBody.styles';

const GalleryBody = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.subText}>1 prayer</Text>
      <View></View>
    </View>
  );
};

export default GalleryBody;
