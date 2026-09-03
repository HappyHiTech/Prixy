import { View, Text } from "react-native";

import CompactRequestcard from "@/components/CompactRequestCard/CompactRequestCard";

import { styles } from "./RequestView.styles";

const RequestView = () => {
  return (
    <View style={styles.container}>
      <CompactRequestcard />
      <CompactRequestcard />
      <CompactRequestcard />
      <CompactRequestcard />
      <CompactRequestcard />
      <CompactRequestcard />
      <CompactRequestcard />
    </View>
  );
};

export default RequestView;
