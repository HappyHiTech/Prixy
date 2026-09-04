import { StyleSheet } from "react-native";

import { COLORS, dropShadow, fontFamilly } from "@/constants";

export const styles = StyleSheet.create({
  container: {
    minHeight: 600,
    ...dropShadow("#000", 0.25, 4, 0),

    backgroundColor: COLORS.primary,
    borderRadius: 15,
  },

  stateIndicator: {
    marginTop: 40,
  },
  stateText: {
    ...fontFamilly(400),
    marginTop: 40,
    paddingHorizontal: 20,
    color: COLORS.secondaryText,
    textAlign: "center",
  },
});
