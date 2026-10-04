import { useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  withSpring,
  withTiming,
  type EntryExitAnimationFunction,
} from 'react-native-reanimated';
import { Mic, Pencil, NotebookPenIcon } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

import { useActionButtonStore } from '@/stores/useActionButtonStore';

import { COLORS, DURATION, EASE, SPRING } from '@/constants';

import { styles } from './ActionButton.styles';

const WIDTH = 327;
const HEIGHT = 204;

const cardPath =
  'M297 4C311.359 4 323 15.6406 323 30V174C323 188.359 311.359 200 297 ' +
  '200H228.507C199.011 196.954 200.832 178 163.5 178C126.168 178 126.733 ' +
  '196.954 98.1904 200H30C15.6406 200 4 188.359 4 174V30C4 15.6406 15.6406 ' +
  '4 30 4H297Z';

const cardEntering: EntryExitAnimationFunction = () => {
  'worklet';
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: 24 }, { scale: 0.6 }],
    },
    animations: {
      opacity: withTiming(1, { duration: DURATION.fast }),
      transform: [
        { translateY: withSpring(0, SPRING.snappy) },
        { scale: withSpring(1, SPRING.snappy) },
      ],
    },
  };
};

const cardExiting: EntryExitAnimationFunction = () => {
  'worklet';
  const config = { duration: DURATION.fast, easing: EASE.inOut };
  return {
    initialValues: {
      opacity: 1,
      transform: [{ translateY: 0 }, { scale: 1 }],
    },
    animations: {
      opacity: withTiming(0, config),
      transform: [
        { translateY: withTiming(16, config) },
        { scale: withTiming(0.7, config) },
      ],
    },
  };
};

const ActionButton = () => {
  const router = useRouter();
  const closeAction = useActionButtonStore((s) => s.closeAction);

  return (
    <Animated.View
      style={styles.container}
      entering={FadeIn.duration(DURATION.fast)}
      exiting={FadeOut.duration(DURATION.fast)}
    >
      <Pressable style={styles.backdrop} onPress={closeAction} />

      <Animated.View
        style={styles.actionButton}
        entering={cardEntering}
        exiting={cardExiting}
      >
        <Svg
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={styles.shape}
        >
          <Path d={cardPath} fill={COLORS.primary} />
        </Svg>
        <View style={styles.content}>
          <Pressable
            style={styles.option}
            onPress={() => {
              closeAction();
              router.push('/quick-capture');
            }}
          >
            <NotebookPenIcon />
            <Text style={styles.text}>Quick Capture</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={() => {}}>
            <Mic />
            <Text style={styles.text}>Record</Text>
          </Pressable>
          <Pressable
            style={styles.option}
            onPress={() => {
              closeAction();
              router.push('/edit-prayer');
            }}
          >
            <Pencil />
            <Text style={styles.text}>Manual</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default ActionButton;
