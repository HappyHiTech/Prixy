import { View, Pressable, Text } from "react-native";

import PrayeeAvatar from "../PrayeeAvatar/PrayeeAvatar";
import CategorySelector from "../CategorySelector/CategorySelector";

import type { PrayerRequest } from "@/types/prayerRequest";

import { styles } from "./CompactRequestCard.styles";

type CompactRequestCardProp = {
  prayReq: PrayerRequest;
};

const CompactRequestcard = ({ prayReq }: CompactRequestCardProp) => {
  return (
    <Pressable style={styles.container}>
      <View style={styles.leftOfCard}>
        <PrayeeAvatar />
      </View>
      <View style={styles.rightOfCard}>
        <Text style={styles.requestText}>{prayReq.requestText}</Text>
        <CategorySelector />
      </View>
    </Pressable>
  );
};

export default CompactRequestcard;
