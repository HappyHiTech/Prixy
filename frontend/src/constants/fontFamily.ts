import { TextStyle } from "react-native";

const FONT_FAMILY_BY_WEIGHT = {
  100: "DMSans_100Thin",
  200: "DMSans_200ExtraLight",
  300: "DMSans_300Light",
  400: "DMSans_400Regular",
  500: "DMSans_500Medium",
  600: "DMSans_600SemiBold",
  700: "DMSans_700Bold",
  800: "DMSans_800ExtraBold",
  900: "DMSans_900Black",
} as const;

type FontWeight = keyof typeof FONT_FAMILY_BY_WEIGHT;

export const fontFamilly = (weight: FontWeight = 600): TextStyle => ({
  fontFamily: FONT_FAMILY_BY_WEIGHT[weight],
});
