import { useState } from 'react';
import { View } from 'react-native';

import FilterBox from './FilterBox/FilterBox';
import GalleryFilterSheet from '../GalleryFilterSheet/GalleryFilterSheet';

import type { FilterType } from '../GalleryFilterSheet/GalleryFilterSheet';
import { styles } from './GalleryFilters.styles';

const GalleryFilters = () => {
  const [openFilter, setOpenFilter] = useState<FilterType | null>(null);

  return (
    <View style={styles.container}>
      <FilterBox type="Prayee" onPress={() => setOpenFilter('Prayee')} />
      <FilterBox type="Category" onPress={() => setOpenFilter('Category')} />
      <FilterBox type="Status" onPress={() => setOpenFilter('Status')} />

      {openFilter && (
        <GalleryFilterSheet
          type={openFilter}
          onClose={() => setOpenFilter(null)}
        />
      )}
    </View>
  );
};

export default GalleryFilters;
