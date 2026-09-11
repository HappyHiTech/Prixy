import { View, Text, Pressable } from 'react-native';

import { CheckCircle } from 'lucide-react-native';

import { useEditPrayerDraftStore } from '../../stores/useEditPrayerDraftStore';

import { COLORS } from '@/constants';

import { styles } from './EditAnswered.style';

const EditAnswered = () => {
  const isAnswered = useEditPrayerDraftStore((s) => s.answered);
  const setAnswered = useEditPrayerDraftStore((s) => s.setAnswered);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setAnswered(!isAnswered)}
        accessibilityRole="button"
        accessibilityState={{ selected: isAnswered }}
        style={[styles.pill, isAnswered && styles.pillAnswered]}
      >
        <CheckCircle
          size={24}
          color={isAnswered ? COLORS.primary : COLORS.accent}
        />
        <Text style={[styles.text, isAnswered && styles.textAnswered]}>
          {isAnswered ? 'Answered' : 'Mark As Answered'}
        </Text>
      </Pressable>
    </View>
  );
};

export default EditAnswered;
