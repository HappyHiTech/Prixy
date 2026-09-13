import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';

import GoBackButton from '@/components/GoBackButton/GoBackButton';

import { styles } from './GalleryHeader.style';

const GalleryHeader = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <GoBackButton onPress={() => router.push('/home')} />
      <Text style={styles.title}>Gallery</Text>
    </View>
  );
};

export default GalleryHeader;
