import { View } from "react-native";

import StatsCard from "@/features/home/components/StatsCard/StatsCard";
import ProfileButton from "@/components/ProfileButton/ProfileButton";
import SegmentedControlSection from "@/features/home/components/SegmentedControlSection/SegmentedControlSection";
import RequestView from "@/features/home/components/RequestView/RequestView";

import { styles } from "./HomeScreen.styles";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatsCard />
        <ProfileButton />
      </View>
      <View style={styles.body}>
        <SegmentedControlSection />
        <RequestView />
      </View>
    </View>
  );
};

export default HomeScreen;
