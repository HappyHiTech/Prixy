import { StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 50,
    backgroundColor: colors.accent,

    borderRadius: "50%",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.35,

    shadowRadius: 4,
  },

  icon: {
    fontSize: 10,
  },
});
