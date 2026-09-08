import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import PrayeeSidebar from '@/features/prayee/components/PrayeeSidebar/PrayeeSidebar';
import CategorySidebar from '@/features/category/components/CategorySideBar/CategorySidebar';

import EditPrayerHeader from '@/features/editPrayer/components/EditPrayerHeader/EditPrayerHeader';
import EditPrayeeCategory from '@/features/editPrayer/components/EditPrayeeCategory/EditPrayeeCategory';
import EditPrayerRequest from '@/features/editPrayer/components/EditPrayerRequest/EditPrayerRequest';
import EditFrequncy from '@/features/editPrayer/components/EditFrequncy/EditFrequncy';
import EditAnswered from '@/features/editPrayer/components/EditAnswered/EditAnswered';

import { useEditPrayerStore } from '@/features/editPrayer/stores/useEditPrayerStore';

import { styles } from './EditPrayerScreen.styles';

const EditPrayerScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const selectedEdit = useEditPrayerStore((s) => s.selectedEdit);
  const setSelectedEdit = useEditPrayerStore((s) => s.setSelectedEdit);

  const closeSidebar = () => setSelectedEdit(null);

  return (
    <View style={styles.container}>
      <EditPrayerHeader />
      <EditPrayeeCategory />
      <EditPrayerRequest />
      <EditFrequncy />
      <EditAnswered />
      {selectedEdit === 'prayee' && (
        <PrayeeSidebar prayerId={id} onClose={closeSidebar} />
      )}
      {selectedEdit === 'category' && (
        <CategorySidebar prayerId={id} onClose={closeSidebar} />
      )}
    </View>
  );
};

export default EditPrayerScreen;
