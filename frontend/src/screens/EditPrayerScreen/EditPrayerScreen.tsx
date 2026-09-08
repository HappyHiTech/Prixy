import { View } from 'react-native';

import EditPrayerHeader from '@/features/editPrayer/components/EditPrayerHeader/EditPrayerHeader';
import EditPrayeeCategory from '@/features/editPrayer/components/EditPrayeeCategory/EditPrayeeCategory';
import EditPrayerRequest from '@/features/editPrayer/components/EditPrayerRequest/EditPrayerRequest';
import EditFrequncy from '@/features/editPrayer/components/EditFrequncy/EditFrequncy';

import { styles } from './EditPrayerScreen.styles';

const EditPrayerScreen = () => {
  return (
    <View style={styles.container}>
      <EditPrayerHeader />
      <EditPrayeeCategory />
      <EditPrayerRequest />
      <EditFrequncy />
    </View>
  );
};

export default EditPrayerScreen;
