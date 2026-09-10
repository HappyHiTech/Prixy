import { View, Text, Pressable } from 'react-native';

import { styles } from './EditDeleteButton.styles';

const EditDeleteButton = () => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button}>
        <Text style={styles.text}>Delete</Text>
      </Pressable>
    </View>
  );
};

export default EditDeleteButton;
