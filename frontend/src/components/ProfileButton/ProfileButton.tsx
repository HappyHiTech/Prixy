import { View } from "react-native";
import { User } from "lucide-react-native";

import { styles } from "./ProfileButton.styles";

const ProfileButton = () => {
  return (
    <View style={styles.container}>
      <User size={26} color="#FFFFFF" />
    </View>
  );
};

export default ProfileButton;
