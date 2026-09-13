import { View } from 'react-native';

import GalleryHeader from '@/features/gallery/components/GalleryHeader/GalleryHeader';
import GalleryFilters from '@/features/gallery/components/GalleryFilters/GalleryFilters';
import GalleryBody from '@/features/gallery/components/GalleryBody/GalleryBody';
import PrayeeSidebar from '@/features/prayee/components/PrayeeSidebar/PrayeeSidebar';
import CategorySidebar from '@/features/category/components/CategorySideBar/CategorySidebar';

import { useHomeStore } from '@/features/home/stores/useHomeStore';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/prayerRequest/useUpdatePrayerRequestMutation';

import { styles } from './GalleryScreen.styles';

const GalleryScreen = () => {
  const selectedPrayerId = useHomeStore((s) => s.selectedPrayerId);
  const setSelectedPrayerId = useHomeStore((s) => s.setSelectedPrayerId);
  const selectedEdit = useHomeStore((s) => s.selectedEdit);
  const setSelectedEdit = useHomeStore((s) => s.setSelectedEdit);

  const closeSidebar = () => {
    setSelectedPrayerId(null);
    setSelectedEdit(null);
  };

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSidebarSelect = (updates: {
    prayeeId?: string;
    categoryId?: string;
  }) => {
    if (!selectedPrayerId) return;
    mutate({ id: selectedPrayerId, ...updates }, { onSuccess: closeSidebar });
  };

  return (
    <View style={styles.container}>
      <GalleryHeader />
      <GalleryFilters />
      <GalleryBody />

      {selectedPrayerId && selectedEdit === 'prayee' && (
        <PrayeeSidebar
          onSelect={(prayeeId) => handleSidebarSelect({ prayeeId })}
          isSaving={isSaving}
          onClose={closeSidebar}
        />
      )}
      {selectedPrayerId && selectedEdit === 'category' && (
        <CategorySidebar
          onSelect={(categoryId) => handleSidebarSelect({ categoryId })}
          isSaving={isSaving}
          onClose={closeSidebar}
        />
      )}
    </View>
  );
};

export default GalleryScreen;
