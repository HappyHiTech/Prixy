import { View } from 'react-native';

import EditPrayerHeader from '@/features/editPrayer/components/EditPrayerHeader/EditPrayerHeader';
import EditPrayeeCategory from '@/features/editPrayer/components/EditPrayeeCategory/EditPrayeeCategory';

import { styles } from './EditPrayerScreen.styles';

const EditPrayerScreen = () => {
  return (
    <View style={styles.container}>
      <EditPrayerHeader />
      <EditPrayeeCategory />
    </View>
  );
};

export default EditPrayerScreen;
