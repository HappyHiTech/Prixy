import { Tabs } from 'expo-router/js-tabs';

import TabBar from '@/components/TabBar/TabBar';
import { tabDepthTransition } from '@/components/TabBar/tabDepthTransition';
import { useRefetchDeckOnForeground } from '@/hooks/TanStack/deck/useRefetchDeckOnForeground';

export default function TabsLayout() {
  useRefetchDeckOnForeground();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      detachInactiveScreens={false}
      screenOptions={{ headerShown: false, ...tabDepthTransition }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="pray" />
    </Tabs>
  );
}
