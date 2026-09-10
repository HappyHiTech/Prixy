import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import GoBackButton from '@/components/GoBackButton/GoBackButton';

import type { Prayee } from '@/types/prayee';

import { styles } from './EditPrayerHeader.styles';

type EditPrayerHeaderProp = {
  prayee?: Prayee;
};

const EditPrayerHeader = ({ prayee }: EditPrayerHeaderProp) => {
  const router = useRouter();

  const firstName = prayee?.name.trim().split(/\s+/)[0];

  return (
    <View style={styles.container}>
      <GoBackButton onPress={() => router.push('/home')} />
      {firstName && <Text style={styles.title}>Prayer For {firstName}</Text>}
    </View>
  );
};

export default EditPrayerHeader;
