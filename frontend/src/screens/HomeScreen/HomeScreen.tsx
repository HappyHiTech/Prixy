import { View, ScrollView } from "react-native";
import { router } from "expo-router";

import StatsCard from "@/features/home/components/StatsCard/StatsCard";
import ProfileButton from "@/components/ProfileButton/ProfileButton";
import SegmentedControlSection from "@/features/home/components/SegmentedControlSection/SegmentedControlSection";
import RequestView from "@/features/home/components/RequestView/RequestView";

import NavBar from "@/components/NavBar/Navbar";

import { useAuthStore } from "@/stores/useAuthStore";

import { styles } from "./HomeScreen.styles";

const HomeScreen = () => {
  const signOut = useAuthStore((s) => s.signOut);

  // TEMPORARY: the profile screen doesn't exist yet, so this doubles as a
  // sign-out so the auth flow can be re-run from the app.
  const handleProfilePress = async () => {
    await signOut();
    router.replace("/");
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
    </View>
  );
};

export default HomeScreen;
