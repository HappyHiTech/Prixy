import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Layers } from 'lucide-react-native';

import { styles } from './GalleryButton.style';

const GalleryButton = () => {
  const router = useRouter();

  return (
    <Pressable style={styles.container} onPress={() => router.push('/gallery')}>
      <Layers size={20} color="#FFFFFF" />
    </Pressable>
  );
};

export default GalleryButton;
