import { useRouter } from 'expo-router';
import { Text, View, Alert } from 'react-native';

import GoBackButton from '@/components/GoBackButton/GoBackButton';

import {
  selectIsPrayerDraftDirty,
  useEditPrayerDraftStore,
} from '@/features/editPrayer/stores/useEditPrayerDraftStore';

import type { Prayee } from '@/types/prayee';

import { styles } from './EditPrayerHeader.styles';

type EditPrayerHeaderProp = {
  prayee?: Prayee;
};

const EditPrayerHeader = ({ prayee }: EditPrayerHeaderProp) => {
  const router = useRouter();

  const isDirty = useEditPrayerDraftStore(selectIsPrayerDraftDirty);

  const firstName = prayee?.name.trim().split(/\s+/)[0];

  const handleBack = () => {
    if (!isDirty) {
      router.push('/home');
      return;
    }

    Alert.alert(
      'Discard changes?',
      'Your edits have not been saved yet. Leaving now will discard them.',
      [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.push('/home'),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <GoBackButton onPress={handleBack} />
      {firstName && <Text style={styles.title}>Prayer For {firstName}</Text>}
    </View>
  );
};

export default EditPrayerHeader;
