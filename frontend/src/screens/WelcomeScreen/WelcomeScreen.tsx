import { View, Text, Pressable } from "react-native";

import { styles } from "./WelcomeScreen.styles";

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prixy</Text>
      <Pressable style={styles.startedButton}>
        <Text style={styles.startedText}>Get Started</Text>
      </Pressable>
    </View>
  );
};

export default WelcomeScreen;
