import { View } from "react-native";

import SegmentedPill from "../SegmentedPill/SegmentedPill";

import { styles } from "./SegmentedControlSection.styles";

const SegmentedControlSection = () => {
  return (
    <View style={styles.container}>
      <SegmentedPill text="Inbox" />
      <SegmentedPill text="Active Deck" />
    </View>
  );
};

export default SegmentedControlSection;
