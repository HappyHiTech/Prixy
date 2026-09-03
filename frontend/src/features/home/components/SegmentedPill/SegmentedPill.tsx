import { Pressable, Text } from "react-native";

import { useHomeStore } from "../../stores/useHomeStore";

import { styles } from "./SegmentedPill.styles";

type SegmentedPillProp = {
  text: string;
};

const SegmentedPill = ({ text }: SegmentedPillProp) => {
  const activeSegment = useHomeStore((s) => s.activeSegment);
  const setActiveSegment = useHomeStore((s) => s.setActiveSegment);

  const isActive = activeSegment === text;

  return (
    <Pressable
      onPress={() => setActiveSegment(text)}
      style={[styles.container, isActive ? styles.activeSegment : undefined]}
    >
      <Text style={[styles.text, isActive ? styles.activeText : undefined]}>
        {text}
      </Text>
    </Pressable>
  );
};

export default SegmentedPill;
