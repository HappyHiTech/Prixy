import { View } from 'react-native';

import FilterBox from './FilterBox/FilterBox';

import { styles } from './GalleryFilters.styles';

const GalleryFilters = () => {
  return (
    <View style={styles.container}>
      <FilterBox type="Prayee" />
      <FilterBox type="Category" />
      <FilterBox type="Status" />
    </View>
  );
};

export default GalleryFilters;
