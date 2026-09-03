import { StyleSheet } from "react-native";

import { colors } from "@/constants/colors";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: colors.accent,
    borderRadius: 92,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { height: 0, width: 0 },

    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  text: {
    color: colors.primary,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
  },
});
