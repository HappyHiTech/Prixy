import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

import BottomSheet from '@/components/BottomSheet/BottomSheet';

import { ApiError } from '@/apis/apiClient';
import { useCreatePrayeeMutation } from '@/hooks/TanStack/useCreatePrayeeMutation';
import { COLORS } from '@/constants';
import { styles } from './AddPrayeeSheet.styles';

type AddPrayeeSheetProp = {
  onClose: () => void;
};

const AddPrayeeSheet = ({ onClose }: AddPrayeeSheetProp) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useCreatePrayeeMutation();

  const trimmed = name.trim();

  const handleChange = (value: string) => {
    setName(value);
    if (error) setError(null);
  };

  const handleSave = () => {
    if (trimmed.length === 0 || isPending) return;

    mutate(
      { name: trimmed },
      {
        onSuccess: onClose,
        onError: (err) => {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Could not add this name. Please try again.',
          );
        },
      },
    );
  };

  return (
    <BottomSheet
      title="Add a name"
      canSave={trimmed.length > 0}
      isSaving={isPending}
      onClose={onClose}
      onSave={handleSave}
    >
      <View style={styles.body}>
        <Text style={styles.label}>NAME</Text>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={name}
          onChangeText={handleChange}
          placeholder="e.g. Sarah Miller"
          placeholderTextColor={COLORS.secondaryText}
          autoFocus
          autoCapitalize="words"
          maxLength={60}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          editable={!isPending}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </BottomSheet>
  );
};

export default AddPrayeeSheet;
