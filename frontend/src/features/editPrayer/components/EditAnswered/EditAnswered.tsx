import { View, Text, Pressable } from 'react-native';

import { CheckCircle } from 'lucide-react-native';

import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';

import { COLORS } from '@/constants';

import type { PrayerRequestStatus } from '@/types/prayerRequest';

import { styles } from './EditAnswered.style';

type EditAnsweredProps = {
  prayerId: string;
  status: PrayerRequestStatus;
};

const EditAnswered = ({ prayerId, status }: EditAnsweredProps) => {
  const { mutate, isPending } = useUpdatePrayerRequest();

  const isAnswered = status === 'answered';

  const toggle = () => {
    mutate({ id: prayerId, answered: !isAnswered });
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggle}
        disabled={isPending}
        accessibilityRole="button"
        accessibilityState={{ selected: isAnswered, disabled: isPending }}
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
