import { StyleSheet } from "react-native";

import { COLORS, dropShadow, fontFamilly } from "@/constants";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",

    backgroundColor: "#FFFFFF",
    borderColor: "blue",

    borderRadius: 13,

    ...dropShadow("#000000", 0.08, 4, 0),
  },

  stat: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    color: COLORS.secondary,

    ...fontFamilly(800),
    fontSize: 14,
  },

  first: {
    borderRightWidth: 1,
    borderColor: COLORS.borderOne,
  },
});
