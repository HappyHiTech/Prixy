import { useEffect } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  interpolateColor,
  Extrapolation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Check, CircleDot, Repeat, Tag } from 'lucide-react-native';

import { CATEGORY_ICON_MAP, DARK_COLORS, SPRING } from '@/constants';
import { getInitials } from '@/utils';

import type { MockPrayer } from '../../mockPrayers';

import { styles } from './DeckCard.styles';

// Right = "I prayed for this". Left = "prayed, and bring it back tomorrow".
export type SwipeDecision = 'prayed' | 'again';

type DeckCardProps = {
  prayer: MockPrayer;
  // 0 = top of the deck. Cards behind sit slightly lower and smaller.
  index: number;
  onSwiped: (prayer: MockPrayer, decision: SwipeDecision) => void;
};

const MAX_ROTATION = 12;

// Short requests read like a headline; long ones step down so they still fit
// the fixed card height. Checked in order — first tier the text fits wins.
const TEXT_TIERS = [
  { maxChars: 90, style: styles.requestTextLarge },
  { maxChars: 180, style: styles.requestTextMedium },
  { maxChars: Infinity, style: styles.requestTextSmall },
];

const requestTextStyle = (text: string) =>
  TEXT_TIERS.find((tier) => text.length <= tier.maxChars)!.style;
const FLY_OUT_DURATION = 220;

const DeckCard = ({ prayer, index, onSwiped }: DeckCardProps) => {
  const { width } = useWindowDimensions();
  const swipeThreshold = width * 0.28;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const stackIndex = useSharedValue(index);
  const isLeaving = useSharedValue(false);

  // When the card in front leaves, this card springs forward one slot.
  useEffect(() => {
    stackIndex.set(withSpring(index, SPRING.snappy));
  }, [index, stackIndex]);

  const flyOut = (decision: SwipeDecision) => {
    'worklet';
    if (isLeaving.value) return;
    isLeaving.set(true);

    const direction = decision === 'prayed' ? 1 : -1;
    translateX.set(
      withTiming(
        direction * width * 1.5,
        { duration: FLY_OUT_DURATION },
        (done) => {
          if (done) scheduleOnRN(onSwiped, prayer, decision);
        },
      ),
    );
  };

  const pan = Gesture.Pan()
    .enabled(index === 0)
    .onChange((e) => {
      if (isLeaving.value) return;
      translateX.set(translateX.get() + e.changeX);
      translateY.set(translateY.get() + e.changeY * 0.25);
    })
    .onEnd((e) => {
      const flung = Math.abs(e.velocityX) > 900;
      const dragged = Math.abs(translateX.value) > swipeThreshold;

      if (flung || dragged) {
        const goingRight = flung ? e.velocityX > 0 : translateX.value > 0;
        flyOut(goingRight ? 'prayed' : 'again');
        return;
      }

      translateX.set(withSpring(0, SPRING.snappy));
      translateY.set(withSpring(0, SPRING.snappy));
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width, 0, width],
      [-MAX_ROTATION, 0, MAX_ROTATION],
    );

    return {
      opacity: interpolate(stackIndex.value, [0, 2, 3], [1, 0.6, 0]),
      borderColor: interpolateColor(
        translateX.value,
        [-swipeThreshold, 0, swipeThreshold],
        [DARK_COLORS.again, DARK_COLORS.border, DARK_COLORS.prayed],
      ),
      transform: [
        { translateY: stackIndex.value * 18 + translateY.value },
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
        { scale: 1 - stackIndex.value * 0.05 },
      ],
    };
  });

  const prayedStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, swipeThreshold],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const againStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-swipeThreshold, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const CategoryIcon = CATEGORY_ICON_MAP[prayer.categoryIcon] ?? Tag;
  // "Once" reads more naturally on a card than the raw 'one_time' value.
  const isRecurring = prayer.frequencyType === 'recurring';
  const FrequencyIcon = isRecurring ? Repeat : CircleDot;
  const frequencyLabel = isRecurring ? 'Recurring' : 'Once';
  const addedLabel = prayer.daysAgo === 0 ? 'Today' : `${prayer.daysAgo}d`;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.card, { zIndex: 10 - index }, cardStyle]}
        pointerEvents={index === 0 ? 'auto' : 'none'}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(prayer.prayeeName)}
            </Text>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.forLabel}>Praying for</Text>
            <Text style={styles.prayeeName} numberOfLines={1}>
              {prayer.prayeeName}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.requestText, requestTextStyle(prayer.requestText)]}
        >
          {prayer.requestText}
        </Text>

        {/* Category gets its own line so a long name can't push the other
            details off the card; anything past one line is truncated. */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <CategoryIcon size={13} color={DARK_COLORS.mutedText} />
            <Text
              style={[styles.footerText, styles.categoryText]}
              numberOfLines={1}
            >
              {prayer.categoryName}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.footerItem}>
              <FrequencyIcon size={13} color={DARK_COLORS.mutedText} />
              <Text style={styles.footerText}>{frequencyLabel}</Text>
            </View>
            <Text style={styles.footerText}>{addedLabel}</Text>
          </View>
        </View>

        <Animated.View style={[styles.stamp, prayedStampStyle]}>
          <Check size={14} color={DARK_COLORS.prayed} strokeWidth={2.5} />
          <Text style={[styles.stampText, { color: DARK_COLORS.prayed }]}>
            Prayed
          </Text>
        </Animated.View>

        <Animated.View style={[styles.stamp, againStampStyle]}>
          <Repeat size={14} color={DARK_COLORS.again} strokeWidth={2.5} />
          <Text style={[styles.stampText, { color: DARK_COLORS.again }]}>
            Tomorrow
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

export default DeckCard;
