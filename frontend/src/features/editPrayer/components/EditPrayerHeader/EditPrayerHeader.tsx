import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import GoBackButton from '@/components/GoBackButton/GoBackButton';

import { styles } from './EditPrayerHeader.styles';

const EditPrayerHeader = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <GoBackButton onPress={() => router.push('/home')} />
      <Text style={styles.title}>Prayer For Harvey</Text>
    </View>
  );
};

export default EditPrayerHeader;
