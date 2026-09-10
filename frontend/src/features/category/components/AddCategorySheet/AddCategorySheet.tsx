import { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';

import BottomSheet from '@/components/BottomSheet/BottomSheet';
import CategoryAvatar from '@/components/CategoryAvatar/CategoryAvatar';
import IconPicker from '../IconPicker/IconPicker';

import { ApiError } from '@/apis/apiClient';
import { useCreateCategoryMutation } from '@/hooks/TanStack/useCreateCategoryMutation';
import { COLORS, DEFAULT_CATEGORY_ICON } from '@/constants';
import { styles } from './AddCategorySheet.styles';

type AddCategorySheetProp = {
  visible: boolean;
  onClose: () => void;
};

const AddCategorySheet = ({ visible, onClose }: AddCategorySheetProp) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DEFAULT_CATEGORY_ICON);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useCreateCategoryMutation();

  const trimmed = name.trim();

  const close = () => {
    setName('');
    setIcon(DEFAULT_CATEGORY_ICON);
    setError(null);
    onClose();
  };

  const handleChange = (value: string) => {
    setName(value);
    if (error) setError(null);
  };

  const handleSave = () => {
    if (trimmed.length === 0 || isPending) return;

    mutate(
      { name: trimmed, icon },
      {
        onSuccess: close,
        onError: (err) => {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Could not add this category. Please try again.',
          );
        },
      },
    );
  };

  return (
    <BottomSheet
      visible={visible}
      title="Add a Category"
      canSave={trimmed.length > 0}
      isSaving={isPending}
      onCancel={close}
      onSave={handleSave}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.preview}>
          <CategoryAvatar icon={icon} size={64} />
        </View>

        <Text style={styles.label}>NAME</Text>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={name}
          onChangeText={handleChange}
          placeholder="e.g. Small Group"
          placeholderTextColor={COLORS.secondaryText}
          autoFocus
          autoCapitalize="words"
          maxLength={60}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          editable={!isPending}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.iconSection}>
          <Text style={styles.label}>ICON</Text>
          <IconPicker value={icon} onChange={setIcon} disabled={isPending} />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

export default AddCategorySheet;
