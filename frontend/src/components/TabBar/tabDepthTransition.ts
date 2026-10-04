import { Easing } from 'react-native';
import type { BottomTabNavigationOptions } from 'expo-router/js-tabs';

const sceneStyleInterpolator: BottomTabNavigationOptions['sceneStyleInterpolator'] =
  ({ current }) => ({
    sceneStyle: {
      opacity: current.progress.interpolate({
        inputRange: [-1, -0.5, 0, 0.5, 1],
        outputRange: [0, 0.4, 1, 0.4, 0],
      }),
      transform: [
        {
          scale: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [1.08, 1, 0.92],
          }),
        },
      ],
    },
  });

export const tabDepthTransition: Pick<
  BottomTabNavigationOptions,
  'sceneStyleInterpolator' | 'transitionSpec'
> = {
  sceneStyleInterpolator,
  transitionSpec: {
    animation: 'timing',
    config: { duration: 320, easing: Easing.bezier(0.22, 1, 0.36, 1) },
  },
};
