import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';

import StatsCard from '@/features/home/components/StatsCard/StatsCard';
import ProfileButton from '@/components/ProfileButton/ProfileButton';
import GalleryButton from '@/components/GalleryButton/GalleryButton';
import SegmentedControlSection from '@/features/home/components/SegmentedControlSection/SegmentedControlSection';
import RequestView from '@/features/home/components/RequestView/RequestView';
import PrayeeSidebar from '@/features/prayee/components/PrayeeSidebar/PrayeeSidebar';

import { useAuthStore } from '@/stores/useAuthStore';

import { useUpdatePrayerRequest } from '@/hooks/TanStack/prayerRequest/useUpdatePrayerRequestMutation';

import type { EditTarget } from '@/features/editPrayer/stores/useEditPrayerStore';

import { styles } from './HomeScreen.styles';
import CategorySidebar from '@/features/category/components/CategorySideBar/CategorySidebar';

type SidebarSelection = { prayerId: string; field: EditTarget } | null;

const HomeScreen = () => {
  const signOut = useAuthStore((s) => s.signOut);

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

  const handleProfilePress = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatsCard />
        <View style={styles.headerRight}>
          <GalleryButton />

          <ProfileButton onPress={handleProfilePress} />
        </View>
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControlSection />
        <RequestView
          onEditField={(prayerId, field) => setSelection({ prayerId, field })}
        />
      </ScrollView>
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

export default HomeScreen;
