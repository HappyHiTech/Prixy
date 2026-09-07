import { Pressable, Text } from 'react-native';
import { EllipsisIcon } from 'lucide-react-native';

import { styles } from './PrayeeAvatar.styles';

type PrayeeAvatarProp = {
  onPress?: () => void;
  icon?: string | null;
};

const PrayeeAvatar = ({ icon, onPress }: PrayeeAvatarProp) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {icon ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : (
        <EllipsisIcon size={24} color="#000" />
      )}
    </Pressable>
  );
};

export default PrayeeAvatar;
