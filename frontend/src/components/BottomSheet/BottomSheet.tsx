import {
  View,
  Text,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SlideInDown,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { COLORS } from '@/constants';

import { styles } from './BottomSheet.styles';

const DISMISS_DISTANCE = 120;
const DURATION = 250;

type BottomSheetProps = {
  title: string;
  saveLabel?: string;
  canSave: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
};

const BottomSheet = ({
  title,
  saveLabel = 'Save',
  canSave,
  isSaving = false,
  onClose,
  onSave,
  children,
}: BottomSheetProps) => {
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(0);

  const close = () => {
    translateY.value = withTiming(height, { duration: DURATION }, (done) => {
      if (done) scheduleOnRN(onClose);
    });
  };

  const pan = Gesture.Pan()
    .enabled(!isSaving)
    .onChange((e) => {
      translateY.value = Math.max(0, translateY.value + e.changeY);
    })
    .onEnd(() => {
      if (translateY.value > DISMISS_DISTANCE) {
        translateY.value = withTiming(
          height,
          { duration: DURATION },
          (done) => {
            if (done) scheduleOnRN(onClose);
          },
        );
      } else {
        translateY.value = withTiming(0, { duration: DURATION });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const isSaveDisabled = !canSave || isSaving;

  return (
    <Modal visible transparent animationType="none" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={isSaving ? undefined : close}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable onPress={() => {}}>
            <Animated.View
              style={[styles.sheet, sheetStyle]}
              entering={SlideInDown.duration(DURATION)}
            >
              <GestureDetector gesture={pan}>
                <View style={styles.handleArea}>
                  <View style={styles.handle} />
                </View>
              </GestureDetector>

              <View style={styles.header}>
                <Pressable
                  style={styles.actionButton}
                  onPress={close}
                  disabled={isSaving}
                >
                  <Text
                    style={[styles.action, isSaving && styles.actionDisabled]}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Text style={styles.title}>{title}</Text>

                <Pressable
                  style={[styles.actionButton, styles.actionRight]}
                  onPress={onSave}
                  disabled={isSaveDisabled}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={COLORS.accent} />
                  ) : (
                    <Text
                      style={[
                        styles.action,
                        isSaveDisabled && styles.actionDisabled,
                      ]}
                    >
                      {saveLabel}
                    </Text>
                  )}
                </Pressable>
              </View>

              {children}
            </Animated.View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default BottomSheet;
