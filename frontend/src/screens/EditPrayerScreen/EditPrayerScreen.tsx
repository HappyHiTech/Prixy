import { View } from 'react-native';

import EditPrayerHeader from '@/features/editPrayer/components/EditPrayerHeader/EditPrayerHeader';
import EditPrayeeCategory from '@/features/editPrayer/components/EditPrayeeCategory/EditPrayeeCategory';
import EditPrayerRequest from '@/features/editPrayer/components/EditPrayerRequest/EditPrayerRequest';

import { styles } from './EditPrayerScreen.styles';

const EditPrayerScreen = () => {
  return (
    <View style={styles.container}>
      <EditPrayerHeader />
      <EditPrayeeCategory />
      <EditPrayerRequest />
    </View>
  );
};

export default EditPrayerScreen;
