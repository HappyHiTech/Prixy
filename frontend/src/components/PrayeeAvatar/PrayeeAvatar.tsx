import { Pressable } from "react-native";
import { EllipsisIcon } from "lucide-react-native";

import { styles } from "./PrayeeAvatar.styles";

const PrayeeAvatar = () => {
  return (
    <Pressable style={styles.container}>
      <EllipsisIcon size={24} color="#000" />
    </Pressable>
  );
};

export default PrayeeAvatar;
