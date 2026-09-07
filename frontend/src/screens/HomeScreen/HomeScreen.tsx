import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';

import StatsCard from '@/features/home/components/StatsCard/StatsCard';
import ProfileButton from '@/components/ProfileButton/ProfileButton';
import SegmentedControlSection from '@/features/home/components/SegmentedControlSection/SegmentedControlSection';
import RequestView from '@/features/home/components/RequestView/RequestView';
import PrayeeSidebar from '@/features/prayee/components/PrayeeSidebar/PrayeeSidebar';
import ActionButton from '@/components/ActionButton/ActionButton';

import NavBar from '@/components/NavBar/Navbar';

import { useHomeStore } from '@/features/home/stores/useHomeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useActionButtonStore } from '@/stores/useActionButtonStore';

import { styles } from './HomeScreen.styles';
import CategorySidebar from '@/features/category/components/CategorySideBar/CategorySidebar';

const HomeScreen = () => {
  const signOut = useAuthStore((s) => s.signOut);
  const selectedPrayerId = useHomeStore((s) => s.selectedPrayerId);
  const selectedEdit = useHomeStore((s) => s.selectedEdit);
  const isActionOpen = useActionButtonStore((s) => s.isActionOpen);

  // TEMPORARY: the profile screen doesn't exist yet, so this doubles as a
  // sign-out so the auth flow can be re-run from the app.
  const handleProfilePress = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatsCard />
        <ProfileButton onPress={handleProfilePress} />
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControlSection />
        <RequestView />
      </ScrollView>
      <NavBar />
      {selectedPrayerId && selectedEdit === 'prayee' && <PrayeeSidebar />}
      {selectedPrayerId && selectedEdit === 'category' && <CategorySidebar />}
      {isActionOpen && <ActionButton />}
    </View>
  );
};

export default HomeScreen;
