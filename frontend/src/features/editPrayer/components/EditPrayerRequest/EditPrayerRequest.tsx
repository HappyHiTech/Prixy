import { View, Text, Pressable } from 'react-native';
import { PencilIcon } from 'lucide-react-native';

import { styles } from './EditPrayerRequest.styles';

const EditPrayerRequest = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.text}>
          Pray that he can finish the project that is working on. It’s a project
          about prayer request and managing them so that people can be more
          consistent on praying for others. The app seeks to make praying for
          others easier
        </Text>
        <Pressable style={styles.edit}>
          <PencilIcon size={18} color="#747474" />
        </Pressable>
      </View>
    </View>
  );
};

export default EditPrayerRequest;
