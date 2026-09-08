import { Pressable, Text } from 'react-native';
import { EllipsisIcon } from 'lucide-react-native';

import { styles } from './PrayeeAvatar.styles';

type PrayeeAvatarProp = {
  size?: number;
  onPress?: () => void;
  icon?: string | null;
};

const PrayeeAvatar = ({ size = 51, icon, onPress }: PrayeeAvatarProp) => {
  const borderWidth = Math.max(1, Math.round(size * 0.06));
  const innerSize = size - borderWidth * 2;
  const iconSize = Math.round(innerSize * 0.6);
  const fontSize = Math.round(innerSize * 0.45);

  return (
    <Pressable
      style={[styles.container, { width: size, height: size, borderWidth }]}
      onPress={onPress}
    >
      {icon ? (
        <Text style={[styles.icon, { fontSize }]} numberOfLines={1}>
          {icon}
        </Text>
      ) : (
        <EllipsisIcon size={iconSize} color="#000" />
      )}
    </Pressable>
  );
};

export default PrayeeAvatar;
