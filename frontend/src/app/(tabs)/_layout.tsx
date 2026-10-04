import { Tabs } from 'expo-router/js-tabs';

import TabBar from '@/components/TabBar/TabBar';
import { tabDepthTransition } from '@/components/TabBar/tabDepthTransition';
import { useRefetchDeckOnForeground } from '@/hooks/TanStack/deck/useRefetchDeckOnForeground';

export default function TabsLayout() {
  // Here, not in a screen: tabs mount lazily and both read the deck.
  useRefetchDeckOnForeground();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, ...tabDepthTransition }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="pray" />
    </Tabs>
  );
}
