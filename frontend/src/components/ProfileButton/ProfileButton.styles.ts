import { StyleSheet } from "react-native";
import { COLORS, dropShadow } from "@/constants";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 50,
    backgroundColor: COLORS.accent,
    ...dropShadow("#000000", 0.35, 4, 0),

    borderRadius: "50%",
  },

  icon: {
    fontSize: 10,
  },
});
