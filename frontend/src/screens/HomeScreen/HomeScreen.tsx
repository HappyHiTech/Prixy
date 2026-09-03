import { View, ScrollView } from "react-native";

import StatsCard from "@/features/home/components/StatsCard/StatsCard";
import ProfileButton from "@/components/ProfileButton/ProfileButton";
import SegmentedControlSection from "@/features/home/components/SegmentedControlSection/SegmentedControlSection";
import RequestView from "@/features/home/components/RequestView/RequestView";

import NavBar from "@/components/NavBar/Navbar";

import { styles } from "./HomeScreen.styles";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatsCard />
        <ProfileButton />
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
