import { StyleSheet } from "react-native";

import { COLORS, fontFamilly } from "@/constants";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 22,
    paddingHorizontal: 24,
    paddingVertical: 32,

    borderBottomWidth: 2,
    borderColor: COLORS.borderOne,
  },

  leftOfCard: {
    // borderWidth: 1,
  },

  rightOfCard: {
    flex: 1,
    gap: 14,
    // borderWidth: 1,
  },

  requestText: {
    ...fontFamilly(400),
    fontSize: 19,
  },
});
