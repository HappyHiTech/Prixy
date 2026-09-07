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
  onPress?: () => void;
  icon?: string | null;
};

const CategoryAvatar = ({ icon, onPress }: CategoryAvatarProp) => {
  const Icon = isIconName(icon ?? null) ? ICON_MAP[icon as IconName] : Tag;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Icon size={24} color={COLORS.accent} />
    </Pressable>
  );
};

export default CategoryAvatar;
