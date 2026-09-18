import { View, TextInput } from 'react-native';

import { styles } from './TextBody.styles';

const TextBody = () => {
  return (
    <View style={styles.container}>
      <TextInput style={styles.textBody} multiline />
    </View>
  );
};

export default TextBody;
