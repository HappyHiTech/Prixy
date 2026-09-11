import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  ActivityIndicator,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';

import PrayeeSidebar from '@/features/prayee/components/PrayeeSidebar/PrayeeSidebar';
import CategorySidebar from '@/features/category/components/CategorySideBar/CategorySidebar';

import EditPrayerHeader from '@/features/editPrayer/components/EditPrayerHeader/EditPrayerHeader';
import EditPrayeeCategory from '@/features/editPrayer/components/EditPrayeeCategory/EditPrayeeCategory';
import EditPrayerRequest from '@/features/editPrayer/components/EditPrayerRequest/EditPrayerRequest';
import EditFrequncy from '@/features/editPrayer/components/EditFrequncy/EditFrequncy';
import EditAnswered from '@/features/editPrayer/components/EditAnswered/EditAnswered';
import EditDeleteButton from '@/features/editPrayer/components/EditDeleteButton/EditDeleteButton';

import { useEditPrayerStore } from '@/features/editPrayer/stores/useEditPrayerStore';

import { usePrayerRequestByIdQuery } from '@/hooks/TanStack/prayerRequest/usePrayerRequestByIdQuery';
import { usePrayeeQuery } from '@/hooks/TanStack/prayee/usePrayeesQuery';
import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';

import { styles } from './EditPrayerScreen.styles';

const EditPrayerScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const selectedEdit = useEditPrayerStore((s) => s.selectedEdit);
  const setSelectedEdit = useEditPrayerStore((s) => s.setSelectedEdit);

  const closeSidebar = () => setSelectedEdit(null);
  const router = useRouter();

  const {
    data: prayer,
    isPending,
    isError,
    error,
  } = usePrayerRequestByIdQuery(id);
  const { data: prayees } = usePrayeeQuery();
  const { data: categories } = useCategoriesQuery();

  if (isPending) {
    return (
      <View style={styles.container2}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container2}>
        <Text style={styles.errorText}>{error.message}</Text>
        <Pressable
          onPress={() => router.push('/home')}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const prayee = prayees?.find((p) => p.id === prayer.prayeeId);
  const category = categories?.find((c) => c.id === prayer.categoryId);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.body}>
        <EditPrayerHeader prayee={prayee} />
        <EditPrayeeCategory prayee={prayee} category={category} />
        <EditPrayerRequest prayerId={id} requestText={prayer.requestText} />
        <EditFrequncy
          prayerId={id}
          frequencyType={prayer.frequencyType}
          recurringDays={prayer.recurringDays}
        />
        <EditAnswered prayerId={id} status={prayer.status} />
        <EditDeleteButton prayerId={id} />
      </ScrollView>
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
