import { View, Pressable, Text } from "react-native";

import PrayeeAvatar from "../PrayeeAvatar/PrayeeAvatar";
import CategorySelector from "../CategorySelector/CategorySelector";

import { styles } from "./CompactRequestCard.styles";

const CompactRequestcard = () => {
  return (
    <Pressable style={styles.container}>
      <View style={styles.leftOfCard}>
        <PrayeeAvatar />
      </View>
      <View style={styles.rightOfCard}>
        <Text style={styles.requestText}>
          Pray that he can get an internship
        </Text>
        <CategorySelector />
      </View>
    </Pressable>
  );
};

export default CompactRequestcard;
