import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { Trash2 } from 'lucide-react-native';

import { useDeletePrayerRequest } from '@/hooks/TanStack/useDeletePrayersRequestMutation';

import { COLORS } from '@/constants';

import { styles } from './EditDeleteButton.styles';

type EditDeleteButtonProps = {
  prayerId: string;
};

const EditDeleteButton = ({ prayerId }: EditDeleteButtonProps) => {
  const router = useRouter();
  const { mutate, isPending } = useDeletePrayerRequest();

  const confirmDelete = () => {
    Alert.alert(
      'Delete this request?',
      'This prayer request will be permanently removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            mutate(prayerId, {
              onSuccess: () => router.replace('/home'),
              onError: (error) =>
                Alert.alert('Could not delete', error.message),
            }),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={confirmDelete}
        disabled={isPending}
        accessibilityRole="button"
        accessibilityLabel="Delete prayer request"
        accessibilityState={{ disabled: isPending }}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <Trash2 size={20} color={COLORS.dangerText} />
        <Text style={styles.text}>
          {isPending ? 'Deleting…' : 'Delete Request'}
        </Text>
      </Pressable>
    </View>
  );
};

export default EditDeleteButton;
