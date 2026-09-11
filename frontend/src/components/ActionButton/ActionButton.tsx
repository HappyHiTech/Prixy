import { useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { Mic, Pencil } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

import { useCreatePrayerRequestMutation } from '@/hooks/TanStack/prayerRequest/useCreatePrayerRequestMutation';
import { useActionButtonStore } from '@/stores/useActionButtonStore';

import { COLORS } from '@/constants';

import { styles } from './ActionButton.styles';

const WIDTH = 327;
const HEIGHT = 154;

const cardPath =
  'M297 4C311.359 4 323 15.6406 323 30V124C323 138.359 311.359 150 297 ' +
  '150H228.507C199.011 146.954 200.832 128 163.5 128C126.168 128 126.733 ' +
  '146.954 98.1904 150H30C15.6406 150 4 138.359 4 124V30C4 15.6406 15.6406 ' +
  '4 30 4H297Z';

const ActionButton = () => {
  const router = useRouter();
  const closeAction = useActionButtonStore((s) => s.closeAction);
  const { mutate: createPrayer, isPending } = useCreatePrayerRequestMutation();

  const handleManual = () => {
    if (isPending) return;

    createPrayer(undefined, {
      onSuccess: (created) => {
        router.push(`/edit-prayer?id=${created.id}`);
        closeAction();
      },
    });
  };

  return (
    <Pressable style={styles.container} onPress={closeAction}>
      <View style={styles.actionButton}>
        <Svg
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={styles.shape}
        >
          <Path d={cardPath} fill={COLORS.primary} />
        </Svg>
        <Pressable style={styles.content} onPress={() => {}}>
          <Pressable style={styles.option} onPress={() => {}}>
            <Mic />
            <Text style={styles.text}>Record</Text>
          </Pressable>
          <Pressable
            style={styles.option}
            onPress={handleManual}
            disabled={isPending}
          >
            <Pencil />
            <Text style={styles.text}>Manual</Text>
          </Pressable>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default ActionButton;
