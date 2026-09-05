import { StyleSheet } from 'react-native';

import { COLORS, dropShadow } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    backgroundColor: COLORS.accent,
    borderRadius: '50%',

    ...dropShadow('#000000', 0.35, 4.7, 0),
  },
});
