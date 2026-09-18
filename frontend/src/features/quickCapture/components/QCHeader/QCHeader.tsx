import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';

import GoBackButton from '@/components/GoBackButton/GoBackButton';

import { styles } from './QCHeader.styles';

const QCHeader = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <GoBackButton onPress={() => router.back()} />
      <Text style={styles.title}>Quick Capture</Text>
    </View>
  );
};

export default QCHeader;
