import { Pressable } from 'react-native';
import { Tag } from 'lucide-react-native';

import { COLORS, CATEGORY_ICON_MAP } from '@/constants';
import { styles } from './CategoryAvatar.styles';

type CategoryAvatarProp = {
  size?: number;
  onPress?: () => void;
  icon?: string | null;
};

const CategoryAvatar = ({ size = 51, icon, onPress }: CategoryAvatarProp) => {
  const Icon = (icon && CATEGORY_ICON_MAP[icon]) || Tag;

  const borderWidth = Math.max(1, Math.round(size * 0.06));
  const innerSize = size - borderWidth * 2;
  const iconSize = Math.round(innerSize * 0.6);

  return (
    <Pressable
      style={[styles.container, { width: size, height: size, borderWidth }]}
      onPress={onPress}
    >
      <Icon size={iconSize} color={COLORS.accent} />
    </Pressable>
  );
};

export default CategoryAvatar;
