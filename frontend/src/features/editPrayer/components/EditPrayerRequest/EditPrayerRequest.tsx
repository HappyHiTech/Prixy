import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { PencilIcon } from 'lucide-react-native';

import EditRequestSheet from '../EditRequestSheet/EditRequestSheet';

import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';

import { styles } from './EditPrayerRequest.styles';

type EditPrayerRequestProps = {
  prayerId: string;
  requestText: string;
};

const EditPrayerRequest = ({
  prayerId,
  requestText,
}: EditPrayerRequestProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { mutate, isPending } = useUpdatePrayerRequest();

  const handleSave = (text: string) => {
    mutate(
      { id: prayerId, requestText: text },
      { onSuccess: () => setIsSheetOpen(false) },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.text, !requestText && styles.placeholder]}>
          {requestText || 'What are you praying for?'}
        </Text>
        <Pressable style={styles.edit} onPress={() => setIsSheetOpen(true)}>
          <PencilIcon size={18} color="#747474" />
        </Pressable>
      </View>

      {isSheetOpen && (
        <EditRequestSheet
          initialText={requestText}
          isSaving={isPending}
          onClose={() => setIsSheetOpen(false)}
          onSave={handleSave}
        />
      )}
    </View>
  );
};

export default EditPrayerRequest;
