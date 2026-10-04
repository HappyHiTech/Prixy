import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { HandsPrayingIcon } from 'phosphor-react-native';

import {
  selectIsPrayerDraftDirty,
  useEditPrayerDraftStore,
} from '@/features/editPrayer/stores/useEditPrayerDraftStore';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/prayerRequest/useUpdatePrayerRequestMutation';
import { useCreatePrayerRequestMutation } from '@/hooks/TanStack/prayerRequest/useCreatePrayerRequestMutation'; // ← add

import { styles } from './EditSave.styles';

type EditSaveProp = {
  prayerId?: string;
};

const EditSave = ({ prayerId }: EditSaveProp) => {
  const router = useRouter();
  const { mutate: updatePrayer, isPending: isUpdating } =
    useUpdatePrayerRequest();
  const { mutate: createPrayer, isPending: isCreating } =
    useCreatePrayerRequestMutation();

  const isPending = isUpdating || isCreating;

  const isDirty = useEditPrayerDraftStore(selectIsPrayerDraftDirty);

  const handleSave = () => {
    const draft = useEditPrayerDraftStore.getState();

    if (!isDirty) {
      router.back();
      return;
    }

    if (draft.requestText.trim() === '') {
      Alert.alert(
        'Add a request',
        'Write what you are praying for before saving.',
      );
      return;
    }

    if (!prayerId) {
      createPrayer(
        {
          prayeeId: draft.prayeeId,
          categoryId: draft.categoryId,
          requestText: draft.requestText,
          frequencyType: draft.frequencyType,
          recurringDays: draft.recurringDays,
        },
        {
          onSuccess: () => router.back(),
          onError: (error) => Alert.alert('Could not save', error.message),
        },
      );
      return;
    }

    updatePrayer(
      {
        id: prayerId,
        prayeeId: draft.prayeeId,
        categoryId: draft.categoryId,
        requestText: draft.requestText,
        frequencyType: draft.frequencyType,
        recurringDays: draft.recurringDays,
        answered: draft.answered,
      },
      {
        onSuccess: (updated) => {
          useEditPrayerDraftStore.getState().reset(updated);
          router.back();
        },
        onError: (error) => Alert.alert('Could not save', error.message),
      },
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.card}
        onPress={handleSave}
        disabled={isPending}
        accessibilityRole="button"
        accessibilityState={{ disabled: isPending }}
      >
        <HandsPrayingIcon color="#4A4A4A" />
        <Text style={styles.saveText}>{isPending ? 'Saving…' : 'Save'}</Text>
      </Pressable>
    </View>
  );
};

export default EditSave;
