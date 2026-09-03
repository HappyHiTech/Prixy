import { View, Text } from "react-native";

import { styles } from "./StatsCard.styles";

const StatsCard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.stat}>Today: 0</Text>
      <Text style={styles.stat}>Deck: 0</Text>
    </View>
  );
};

export default StatsCard;
