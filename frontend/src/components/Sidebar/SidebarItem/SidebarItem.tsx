import { Pressable, Text } from 'react-native';

import PrayeeAvatar from '@/components/PrayeeAvatar/PrayeeAvatar';

import { getInitials } from '@/utils';
import type { Prayee } from '@/types/prayee';
import { styles } from './SidebarItem.styles';

type SidebarItemProp = {
  prayee: Prayee;
  onPress: () => void;
  disabled?: boolean;
};

const SidebarItem = ({ prayee, onPress, disabled }: SidebarItemProp) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      disabled={disabled}
    >
      <PrayeeAvatar icon={getInitials(prayee.name)} />
      <Text style={styles.text}>{prayee.name}</Text>
    </Pressable>
  );
};

export default SidebarItem;
