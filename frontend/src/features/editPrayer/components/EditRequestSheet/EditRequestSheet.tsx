import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
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

import { styles } from './EditRequestSheet.styles';

const DISMISS_DISTANCE = 120;
const DURATION = 250;

type EditRequestSheetProps = {
  initialText: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
};

const EditRequestSheet = ({
  initialText,
  isSaving = false,
  onClose,
  onSave,
}: EditRequestSheetProps) => {
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(0);

  const [text, setText] = useState(initialText);

  const close = () => {
    translateY.value = withTiming(height, { duration: DURATION }, (done) => {
      if (done) scheduleOnRN(onClose);
    });
  };

  const save = () => {
    onSave(text.trim());
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

  const isUnchanged = text.trim() === initialText.trim();
  const isSaveDisabled = isUnchanged || text.trim() === '' || isSaving;

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

                <Text style={styles.title}>Edit request</Text>

                <Pressable
                  style={[styles.actionButton, styles.actionRight]}
                  onPress={save}
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
                      Save
                    </Text>
                  )}
                </Pressable>
              </View>

              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                numberOfLines={8}
                multiline
                autoFocus
                placeholder="What are you praying for?"
              />
            </Animated.View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default EditRequestSheet;
