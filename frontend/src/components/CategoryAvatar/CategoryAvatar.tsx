import { Pressable } from 'react-native';
import { Church, Home, Users, Heart, Tag } from 'lucide-react-native';

import { COLORS } from '@/constants';
import { styles } from './CategoryAvatar.styles';

const ICON_MAP = {
  church: Church,
  home: Home,
  users: Users,
  heart: Heart,
} as const;

type IconName = keyof typeof ICON_MAP;

const isIconName = (value: string | null): value is IconName =>
  value !== null && value in ICON_MAP;

type CategoryAvatarProp = {
  size?: number;
  onPress?: () => void;
  icon?: string | null;
};

const CategoryAvatar = ({ size = 51, icon, onPress }: CategoryAvatarProp) => {
  const Icon = isIconName(icon ?? null) ? ICON_MAP[icon as IconName] : Tag;

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
