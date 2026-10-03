import { useState } from 'react';
import { View } from 'react-native';

import GalleryHeader from '@/features/gallery/components/GalleryHeader/GalleryHeader';
import GalleryFilters from '@/features/gallery/components/GalleryFilters/GalleryFilters';
import GalleryBody from '@/features/gallery/components/GalleryBody/GalleryBody';
import PrayeeSidebar from '@/features/prayee/components/PrayeeSidebar/PrayeeSidebar';
import CategorySidebar from '@/features/category/components/CategorySideBar/CategorySidebar';

import { useUpdatePrayerRequest } from '@/hooks/TanStack/prayerRequest/useUpdatePrayerRequestMutation';

import type { EditTarget } from '@/features/editPrayer/stores/useEditPrayerStore';

import { styles } from './GalleryScreen.styles';

type SidebarSelection = { prayerId: string; field: EditTarget } | null;

const GalleryScreen = () => {
  const [selection, setSelection] = useState<SidebarSelection>(null);

  const closeSidebar = () => setSelection(null);

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSidebarSelect = (updates: {
    prayeeId?: string;
    categoryId?: string;
  }) => {
    if (!selection) return;
    mutate({ id: selection.prayerId, ...updates }, { onSuccess: closeSidebar });
  };

  return (
    <View style={styles.container}>
      <GalleryHeader />
      <GalleryFilters />
      <GalleryBody
        onEditField={(prayerId, field) => setSelection({ prayerId, field })}
      />

      {selection?.field === 'prayee' && (
        <PrayeeSidebar
          onSelect={(prayeeId) => handleSidebarSelect({ prayeeId })}
          isSaving={isSaving}
          onClose={closeSidebar}
        />
      )}
      {selection?.field === 'category' && (
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
