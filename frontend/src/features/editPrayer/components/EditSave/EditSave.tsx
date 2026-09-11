import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { HandsPrayingIcon } from 'phosphor-react-native';

import {
  selectIsPrayerDraftDirty,
  useEditPrayerDraftStore,
} from '@/features/editPrayer/stores/useEditPrayerDraftStore';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/prayerRequest/useUpdatePrayerRequestMutation';

import { styles } from './EditSave.styles';

type EditSaveProp = {
  prayerId: string;
};

const EditSave = ({ prayerId }: EditSaveProp) => {
  const router = useRouter();
  const { mutate: updatePrayer, isPending } = useUpdatePrayerRequest();

  const isDirty = useEditPrayerDraftStore(selectIsPrayerDraftDirty);

  const handleSave = () => {
    const draft = useEditPrayerDraftStore.getState();

    if (!isDirty) {
      router.push('/home');
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
          router.push('/home');
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
