import { View } from "react-native";

import SegmentedPill from "../SegmentedPill/SegmentedPill";

import { styles } from "./SegmentedControlSection.styles";

const SegmentedControlSection = () => {
  return (
    <View style={styles.container}>
      <SegmentedPill />
    </View>
  );
};

export default SegmentedControlSection;
