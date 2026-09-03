import { StyleSheet } from "react-native";

import { COLORS, dropShadow } from "@/constants";

export const styles = StyleSheet.create({
  container: {
    minHeight: 600,
    ...dropShadow("#000", 0.25, 4, 0),

    backgroundColor: COLORS.primary,
    borderRadius: 15,
  },
});
