import { StyleSheet } from "react-native";

import { COLORS, dropShadow, fontFamilly } from "@/constants";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 5,

    borderRadius: 16,

    shadowRadius: 4,
  },

  activeSegment: {
    backgroundColor: COLORS.accent,

    ...dropShadow("#000000", 0.25, 4, 0),
  },

  text: {
    color: COLORS.secondary,
    ...fontFamilly(600),
    fontSize: 14,
  },

  activeText: {
    color: COLORS.primary,
  },
});
