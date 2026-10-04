import { Tabs } from 'expo-router/js-tabs';

import TabBar from '@/components/TabBar/TabBar';
import { tabDepthTransition } from '@/components/TabBar/tabDepthTransition';

export default function TabsLayout() {
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
