import { ViewStyle } from "react-native";

export const dropShadow = (
  color = "#000",
  opacity = 0.15,
  radius = 4,
  offsetY = 2,
): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: radius, // Android fallback
});
