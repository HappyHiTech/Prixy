import { View, Text, Pressable } from 'react-native';

import { styles } from './QCSaveButton.styles';

const QCSaveButton = () => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button}>
        <Text style={styles.text}>Save</Text>
      </Pressable>
    </View>
  );
};

export default QCSaveButton;
