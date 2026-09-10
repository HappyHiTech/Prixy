import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import SidebarItem from './SidebarItem/SidebarItem';

import { Plus } from 'lucide-react-native';

import type { Prayee } from '@/types/prayee';
import type { Category } from '@/types/category';
import { styles } from './Sidebar.styles';

type SidebarProp = {
  title: string;
  addLabel: string;
  items?: (Prayee | Category)[];
  isPending: boolean;
  isError: boolean;
  isSaving?: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
  exit: () => void;
};

const Sidebar = ({
  title,
  addLabel,
  items = [],
  isError,
  isPending,
  isSaving,
  onSelect,
  onAdd,
  exit,
}: SidebarProp) => {
  return (
    <Pressable style={styles.container} onPress={exit}>
      <Pressable style={styles.sideBar} onPress={() => {}}>
        <Text style={styles.header}>{title}</Text>
        <View style={styles.addContainer}>
          <Pressable
            style={({ pressed }) => [styles.add, pressed && styles.addPressed]}
            onPress={onAdd}
          >
            <Plus size={24} color="#9CA3AF" />
            <Text style={styles.addText}>{addLabel}</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.selections}>
          {isError ? (
            <Text style={styles.addText}>{"Couldn't load"}</Text>
          ) : isPending ? (
            <ActivityIndicator />
          ) : (
            items.map((item) => (
              <SidebarItem
                key={item.id}
                data={item}
                onPress={() => onSelect(item.id)}
                disabled={isSaving}
              />
            ))
          )}
        </ScrollView>
      </Pressable>
    </Pressable>
  );
};

export default Sidebar;
