import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';

import { ApiError } from '@/apis/apiClient';
import { useCapturePrayersMutation } from '@/hooks/TanStack/prayerRequest/useCapturePrayersMutation';
import { useQCStore } from '@/stores/useQCStore';
import { COLORS } from '@/constants';

import { styles } from './QCSaveButton.styles';

const QCSaveButton = () => {
  const router = useRouter();
  const text = useQCStore((s) => s.text);
  const reset = useQCStore((s) => s.reset);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useCapturePrayersMutation();

  const trimmed = text.trim();
  const isDisabled = trimmed.length === 0 || isPending;

  const handleSave = () => {
    if (isDisabled) return;
    setError(null);

    mutate(trimmed, {
      onSuccess: () => {
        reset();
        router.back();
      },
      onError: (err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not save that. Please try again.',
        );
      },
    });
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={isDisabled}
      >
        {isPending ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.spinner}
          />
        ) : (
          <Text style={styles.text}>Save</Text>
        )}
      </Pressable>
    </View>
  );
};

export default QCSaveButton;
