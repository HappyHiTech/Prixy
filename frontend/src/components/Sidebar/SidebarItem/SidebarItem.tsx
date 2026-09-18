import { Pressable, Text, View } from 'react-native';

import { X } from 'lucide-react-native';

import PrayeeAvatar from '@/components/PrayeeAvatar/PrayeeAvatar';
import CategoryAvatar from '@/components/CategoryAvatar/CategoryAvatar';

import { getInitials } from '@/utils';
import type { Prayee } from '@/types/prayee';
import type { Category } from '@/types/category';
import { styles } from './SidebarItem.styles';

type SidebarItemProp = {
  data: Prayee | Category;
  onPress: () => void;
  onDelete?: () => void;
  disabled?: boolean;
};

const SidebarItem = ({
  data,
  onPress,
  onDelete,
  disabled,
}: SidebarItemProp) => {
  const isCategory = (d: Prayee | Category): d is Category => 'isDefault' in d;

  const canDelete = onDelete && !(isCategory(data) && data.isDefault);

  return (
    <View style={styles.row}>
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

        <Text style={styles.text} numberOfLines={1}>
          {data.name}
        </Text>
      </Pressable>

      {canDelete && (
        <Pressable
          style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
          onPress={onDelete}
          disabled={disabled}
          hitSlop={8}
        >
          <X size={18} color="#9CA3AF" />
        </Pressable>
      )}
    </View>
  );
};

export default SidebarItem;
