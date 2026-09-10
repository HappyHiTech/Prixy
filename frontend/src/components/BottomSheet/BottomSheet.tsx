import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { COLORS } from '@/constants';
import { styles } from './BottomSheet.styles';

type BottomSheetProp = {
  visible: boolean;
  title: string;
  saveLabel?: string;
  canSave: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
};

const BottomSheet = ({
  visible,
  title,
  saveLabel = 'Save',
  canSave,
  isSaving,
  onCancel,
  onSave,
  children,
}: BottomSheetProp) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onCancel}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.header}>
              <Pressable onPress={onCancel} disabled={isSaving}>
                <Text style={[styles.action, styles.actionCancel]}>Cancel</Text>
              </Pressable>

              <Text style={styles.title}>{title}</Text>

              {isSaving ? (
                <View style={styles.action}>
                  <ActivityIndicator size="small" color={COLORS.accent} />
                </View>
              ) : (
                <Pressable onPress={onSave} disabled={!canSave}>
                  <Text
                    style={[
                      styles.action,
                      styles.actionSave,
                      !canSave && styles.actionDisabled,
                    ]}
                  >
                    {saveLabel}
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={styles.body}>{children}</View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BottomSheet;
