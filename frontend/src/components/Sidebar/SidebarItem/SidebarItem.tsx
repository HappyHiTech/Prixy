import { Pressable, Text } from 'react-native';

import PrayeeAvatar from '@/components/PrayeeAvatar/PrayeeAvatar';
import CategoryAvatar from '@/components/CategoryAvatar/CategoryAvatar';

import { getInitials } from '@/utils';
import type { Prayee } from '@/types/prayee';
import type { Category } from '@/types/category';
import { styles } from './SidebarItem.styles';

type SidebarItemProp = {
  data: Prayee | Category;
  onPress: () => void;
  disabled?: boolean;
};

const SidebarItem = ({ data, onPress, disabled }: SidebarItemProp) => {
  const isCategory = (d: Prayee | Category): d is Category => 'isDefault' in d;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      disabled={disabled}
    >
      {isCategory(data) ? (
        <CategoryAvatar icon={data.icon} />
      ) : (
        <PrayeeAvatar icon={getInitials(data.name)} />
      )}

      <Text style={styles.text}>{data.name}</Text>
    </Pressable>
  );
};

export default SidebarItem;
