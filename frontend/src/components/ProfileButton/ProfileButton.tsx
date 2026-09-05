import { Pressable } from "react-native";
import { User } from "lucide-react-native";

import { styles } from "./ProfileButton.styles";

type ProfileButtonProps = {
  onPress?: () => void;
};

const ProfileButton = ({ onPress }: ProfileButtonProps) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <User size={20} color="#FFFFFF" />
    </Pressable>
  );
};

export default ProfileButton;
