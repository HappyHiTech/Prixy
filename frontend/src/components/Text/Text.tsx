import { Text as RNText } from "react-native";
import type { TextProps } from "react-native";

import { styles } from "./Text.styles";

const Text = (props: TextProps) => {
  return <RNText {...props} style={[styles.default, props.style]} />;
};

export default Text;
