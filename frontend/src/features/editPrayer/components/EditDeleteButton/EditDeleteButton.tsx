import { View, Text, Pressable, Alert } from 'react-native';

import { Trash2 } from 'lucide-react-native';

import { COLORS } from '@/constants';

import { styles } from './EditDeleteButton.styles';

const EditDeleteButton = () => {
  const confirmDelete = () => {
    Alert.alert(
      'Delete this request?',
      'This prayer request will be permanently removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          // TODO: wire up to a delete mutation once the endpoint exists.
          onPress: () => {},
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={confirmDelete}
        accessibilityRole="button"
        accessibilityLabel="Delete prayer request"
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <Trash2 size={20} color={COLORS.dangerText} />
        <Text style={styles.text}>Delete Request</Text>
      </Pressable>
    </View>
  );
};

export default EditDeleteButton;
