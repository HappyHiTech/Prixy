import { View, Text } from 'react-native';

import { CheckCircle } from 'lucide-react-native';

import { styles } from './EditAnswered.style';

const EditAnswered = () => {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <CheckCircle size={24} />
        <Text style={styles.text}>Mark As Answered</Text>
      </View>
    </View>
  );
};

export default EditAnswered;
