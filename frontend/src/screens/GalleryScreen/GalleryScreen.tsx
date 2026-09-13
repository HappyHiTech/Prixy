import { View } from 'react-native';

import GalleryHeader from '@/features/gallery/components/GalleryHeader/GalleryHeader';
import GalleryFilters from '@/features/gallery/components/GalleryFilters/GalleryFilters';

import { styles } from './GalleryScreen.styles';

const GalleryScreen = () => {
  return (
    <View style={styles.container}>
      <GalleryHeader />
      <GalleryFilters />
    </View>
  );
};

export default GalleryScreen;
