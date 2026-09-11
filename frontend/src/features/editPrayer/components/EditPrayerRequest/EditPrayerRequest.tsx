import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { PencilIcon } from 'lucide-react-native';

import EditRequestSheet from '../EditRequestSheet/EditRequestSheet';

import { useEditPrayerDraftStore } from '@/features/editPrayer/stores/useEditPrayerDraftStore';

import { styles } from './EditPrayerRequest.styles';

const EditPrayerRequest = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const requestText = useEditPrayerDraftStore((s) => s.requestText);
  const setRequestText = useEditPrayerDraftStore((s) => s.setRequestText);

  const handleSave = (text: string) => {
    setRequestText(text);
    setIsSheetOpen(false);
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
          onClose={() => setIsSheetOpen(false)}
          onSave={handleSave}
        />
      )}
    </View>
  );
};

export default EditPrayerRequest;
