import { StyleSheet } from "react-native";

import { COLORS, fontFamily } from "@/constants";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.borderOne,
    borderRadius: 5,
    borderWidth: 1,
  },

  categoryText: {
    ...fontFamily(500),
    color: COLORS.secondaryText,
    fontSize: 12,
  },
});
