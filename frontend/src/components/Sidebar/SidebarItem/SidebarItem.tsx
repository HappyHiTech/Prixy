import { View, Text } from 'react-native';

import PrayeeAvatar from '@/components/PrayeeAvatar/PrayeeAvatar';

import { getInitials } from '@/utils';
import type { Prayee } from '@/types/prayee';
import { styles } from './SidebarItem.styles';

type SidebarItemProp = {
  prayee: Prayee;
};

const SidebarItem = ({ prayee }: SidebarItemProp) => {
  return (
    <View style={styles.container}>
      <PrayeeAvatar icon={getInitials(prayee.name)} />
      <Text style={styles.text}>{prayee.name}</Text>
    </View>
  );
};

export default SidebarItem;
