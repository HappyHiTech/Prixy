import { Easing } from 'react-native-reanimated';

export const DURATION = {
  fast: 180,
} as const;

export const SPRING = {
  snappy: { damping: 20, stiffness: 260, mass: 0.8 },
};

export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};
