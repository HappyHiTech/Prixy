import { Pressable, Text } from 'react-native';

import { useHomeStore, type HomeSegment } from '../../stores/useHomeStore';

import { styles } from './SegmentedPill.styles';

const TEXTMAP: Record<HomeSegment, string> = {
  inbox: 'Inbox',
  active: 'Active deck',
};

type SegmentedPillProp = {
  text: HomeSegment;
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
        {TEXTMAP[text]}
      </Text>
    </Pressable>
  );
};

export default SegmentedPill;
