import { useEffect } from 'react';
import { View, Pressable, Text, type LayoutChangeEvent } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Home, Plus } from 'lucide-react-native';
import { HandsPrayingIcon } from 'phosphor-react-native';

import { useActionButtonStore } from '@/stores/useActionButtonStore';
import { SPRING } from '@/constants';

import { styles, INDICATOR_WIDTH } from './Navbar.styles';

type TabName = 'home' | 'pray';

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

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${plusRotation.value * 135}deg` }],
  }));

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => {
        barWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      <Pressable
        style={styles.navButton}
        onPress={() => goTo('home')}
        accessibilityRole="tab"
        accessibilityState={{ selected: currentRoute === 'home' }}
      >
        <Animated.View style={homeIconStyle}>
          <Home size={24} color="#000000" />
        </Animated.View>
        <Text style={styles.navButtonText}>Home</Text>
      </Pressable>

      <View style={styles.navButtonAdd}>
        <Pressable
          style={styles.addPrayer}
          onPress={toggleAction}
          accessibilityRole="button"
          accessibilityLabel={
            isActionOpen ? 'Close quick actions' : 'Add prayer'
          }
        >
          <Animated.View style={plusStyle}>
            <Plus size={50} color="#FFFFFF" />
          </Animated.View>
        </Pressable>
      </View>

      <Pressable
        style={styles.navButton}
        onPress={() => goTo('pray')}
        accessibilityRole="tab"
        accessibilityState={{ selected: currentRoute === 'pray' }}
      >
        <Animated.View style={prayIconStyle}>
          <HandsPrayingIcon size={24} color="#000000" weight="regular" />
        </Animated.View>
        <Text style={styles.navButtonText}>Pray</Text>
      </Pressable>
    </View>
  );
};

export default NavBar;
