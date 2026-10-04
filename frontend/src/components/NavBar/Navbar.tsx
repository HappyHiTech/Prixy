import { useEffect } from 'react';
import { View, Pressable, Text, type LayoutChangeEvent } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import Animated, {
  interpolateColor,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Home, Plus } from 'lucide-react-native';
import { HandsPrayingIcon } from 'phosphor-react-native';

import { useActionButtonStore } from '@/stores/useActionButtonStore';
import { COLORS, DARK_COLORS, SPRING } from '@/constants';

import { styles, INDICATOR_WIDTH } from './Navbar.styles';

type TabName = 'home' | 'pray';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LIGHT_ICON_COLOR = '#000000';

const NavBar = ({ state, navigation }: BottomTabBarProps) => {
  const isActionOpen = useActionButtonStore((s) => s.isActionOpen);
  const toggleAction = useActionButtonStore((s) => s.toggleAction);
  const closeAction = useActionButtonStore((s) => s.closeAction);

  const currentRoute = state.routes[state.index].name as TabName;

  const tabProgress = useSharedValue(currentRoute === 'pray' ? 1 : 0);
  const barWidth = useSharedValue(0);
  const plusRotation = useSharedValue(0);

  useEffect(() => {
    tabProgress.value = withSpring(
      currentRoute === 'pray' ? 1 : 0,
      SPRING.snappy,
    );
  }, [currentRoute, tabProgress]);

  useEffect(() => {
    plusRotation.value = withSpring(isActionOpen ? 1 : 0, SPRING.snappy);
  }, [isActionOpen, plusRotation]);

  const goTo = (name: TabName) => {
    closeAction();
    navigation.navigate(name);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const quarter = barWidth.value / 4;
    const center = quarter + tabProgress.value * quarter * 2;
    return {
      opacity: barWidth.value === 0 ? 0 : 1,
      transform: [{ translateX: center - INDICATOR_WIDTH / 2 }],
    };
  });

  const homeIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1.12 - tabProgress.value * 0.12 }],
  }));

  const prayIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + tabProgress.value * 0.12 }],
  }));

  // Pray mode is dark, so the bar fades with it instead of staying white.
  const barStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      tabProgress.value,
      [0, 1],
      [COLORS.primary, DARK_COLORS.navBg],
    ),
  }));

  // Capturing a new request mid-session would pull the user out of prayer,
  // so the + shrinks away on the Pray tab (and can't be tapped).
  const isAddHidden = currentRoute === 'pray';

  const addRingStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      tabProgress.value,
      [0, 1],
      [COLORS.primary, DARK_COLORS.navBg],
    ),
    opacity: 1 - tabProgress.value,
    transform: [{ scale: 1 - tabProgress.value * 0.4 }],
  }));

  const indicatorColorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      tabProgress.value,
      [0, 1],
      [COLORS.accent, DARK_COLORS.text],
    ),
  }));

  // SVG icons can't take an animated color, so light/dark copies cross-fade.
  const lightIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - tabProgress.value,
  }));

  const darkIconStyle = useAnimatedStyle(() => ({
    opacity: tabProgress.value,
  }));

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${plusRotation.value * 135}deg` }],
  }));

  return (
    <Animated.View
      style={[styles.container, barStyle]}
      onLayout={(e: LayoutChangeEvent) => {
        barWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <Animated.View
        style={[styles.indicator, indicatorStyle, indicatorColorStyle]}
      />

      <Pressable
        style={styles.navButton}
        onPress={() => goTo('home')}
        accessibilityRole="tab"
        accessibilityState={{ selected: currentRoute === 'home' }}
      >
        <Animated.View style={homeIconStyle}>
          <Animated.View style={lightIconStyle}>
            <Home size={24} color={LIGHT_ICON_COLOR} />
          </Animated.View>
          <Animated.View style={[styles.iconOverlay, darkIconStyle]}>
            <Home size={24} color={DARK_COLORS.text} />
          </Animated.View>
        </Animated.View>
        <Text style={styles.navButtonText}>Home</Text>
      </Pressable>

      <View style={styles.navButtonAdd}>
        <AnimatedPressable
          style={[styles.addPrayer, addRingStyle]}
          onPress={toggleAction}
          disabled={isAddHidden}
          accessibilityElementsHidden={isAddHidden}
          importantForAccessibility={
            isAddHidden ? 'no-hide-descendants' : 'auto'
          }
          accessibilityRole="button"
          accessibilityLabel={
            isActionOpen ? 'Close quick actions' : 'Add prayer'
          }
        >
          <Animated.View style={plusStyle}>
            <Plus size={50} color="#FFFFFF" />
          </Animated.View>
        </AnimatedPressable>
      </View>

      <Pressable
        style={styles.navButton}
        onPress={() => goTo('pray')}
        accessibilityRole="tab"
        accessibilityState={{ selected: currentRoute === 'pray' }}
      >
        <Animated.View style={prayIconStyle}>
          <Animated.View style={lightIconStyle}>
            <HandsPrayingIcon
              size={24}
              color={LIGHT_ICON_COLOR}
              weight="regular"
            />
          </Animated.View>
          <Animated.View style={[styles.iconOverlay, darkIconStyle]}>
            <HandsPrayingIcon
              size={24}
              color={DARK_COLORS.text}
              weight="regular"
            />
          </Animated.View>
        </Animated.View>
        <Text style={styles.navButtonText}>Pray</Text>
      </Pressable>
    </Animated.View>
  );
};

export default NavBar;
