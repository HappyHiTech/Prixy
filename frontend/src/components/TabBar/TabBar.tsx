import type { BottomTabBarProps } from 'expo-router/js-tabs';

import NavBar from '@/components/NavBar/Navbar';
import ActionButton from '@/components/ActionButton/ActionButton';

import { useActionButtonStore } from '@/stores/useActionButtonStore';

const TabBar = (props: BottomTabBarProps) => {
  const isActionOpen = useActionButtonStore((s) => s.isActionOpen);

  return (
    <>
      {isActionOpen && <ActionButton />}
      <NavBar {...props} />
    </>
  );
};

export default TabBar;
