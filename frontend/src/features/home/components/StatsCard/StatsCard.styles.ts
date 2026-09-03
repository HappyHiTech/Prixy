import { StyleSheet } from "react-native";

import { dropShadow, fontFamilly } from "@/constants";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 11,
    backgroundColor: "#FFFFFF",
    borderColor: "blue",

    borderRadius: 13,

    ...dropShadow("#000000", 0.08, 4, 0),
  },

  stat: {
    ...fontFamilly(800),
    fontSize: 16,
  },
});
