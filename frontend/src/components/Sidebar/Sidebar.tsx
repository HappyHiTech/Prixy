import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import SidebarItem from './SidebarItem/SidebarItem';

import { Plus } from 'lucide-react-native';

import type { Prayee } from '@/types/prayee';
import type { Category } from '@/types/category';
import { styles } from './Sidebar.styles';

const WIDTH = 250;
const DURATION = 250;

type SidebarProp = {
  title: string;
  addLabel: string;
  items?: (Prayee | Category)[];
  isPending: boolean;
  isError: boolean;
  isSaving?: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
  exit: () => void;
};

const Sidebar = ({
  title,
  addLabel,
  items = [],
  isError,
  isPending,
  isSaving,
  onSelect,
  onAdd,
  exit,
}: SidebarProp) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const close = () => {
    opacity.value = withTiming(0, { duration: DURATION });
    translateX.value = withTiming(WIDTH, { duration: DURATION }, (done) => {
      if (done) scheduleOnRN(exit);
    });
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleSelect = (id: string) => {
    if (isSaving) return;
    close();
    onSelect(id);
  };

  return (
    <Animated.View
      style={[styles.container, backdropStyle]}
      entering={FadeIn.duration(DURATION)}
    >
      <Pressable style={styles.backdropFill} onPress={close} />
      <Animated.View
        style={[styles.sideBar, panelStyle]}
        entering={SlideInRight.duration(DURATION)}
      >
        <Text style={styles.header}>{title}</Text>
        <View style={styles.addContainer}>
          <Pressable
            style={({ pressed }) => [styles.add, pressed && styles.addPressed]}
            onPress={onAdd}
          >
            <Plus size={24} color="#9CA3AF" />
            <Text style={styles.addText}>{addLabel}</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.selections}>
          {isError ? (
            <Text style={styles.addText}>{"Couldn't load"}</Text>
          ) : isPending ? (
            <ActivityIndicator />
          ) : (
            items.map((item) => (
              <SidebarItem
                key={item.id}
                data={item}
                onPress={() => handleSelect(item.id)}
                disabled={isSaving}
              />
            ))
          )}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

export default Sidebar;
