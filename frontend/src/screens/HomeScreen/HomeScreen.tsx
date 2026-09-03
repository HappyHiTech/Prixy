import { View } from "react-native";
import Text from "@/components/Text/Text";

import StatsCard from "@/features/home/components/StatsCard/StatsCard";
import ProfileButton from "@/components/ProfileButton/ProfileButton";

import { styles } from "./HomeScreen.styles";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatsCard />
        <ProfileButton />
      </View>
      <Text style={styles.title}>Home Screen</Text>
    </View>
  );
};

export default HomeScreen;
