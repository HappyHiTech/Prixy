import { View, Pressable, Text } from "react-native";
import { Home, Plus } from "lucide-react-native";
import { HandsPrayingIcon } from "phosphor-react-native";

import { styles } from "./Navbar.styles";

const NavBar = () => {
  return (
    <View style={styles.container}>
      <Pressable style={[styles.navButton, styles.navButtonActive]}>
        <Home size={24} color="#000000" />
        <Text style={styles.navButtonText}>Home</Text>
      </Pressable>
      <View style={styles.navButtonAdd}>
        <Pressable style={styles.addPrayer}>
          <Plus size={50} color="#FFFFFF" />
        </Pressable>
      </View>
      <Pressable style={styles.navButton}>
        <HandsPrayingIcon size={24} color="#000000" weight="regular" />
        <Text style={styles.navButtonText}>Pray</Text>
      </Pressable>
    </View>
  );
};

export default NavBar;
