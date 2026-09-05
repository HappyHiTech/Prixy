import { StyleSheet } from 'react-native';

import { COLORS, dropShadow, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 76,

    width: 308,
    backgroundColor: COLORS.accent,
    borderRadius: 87,
    ...dropShadow('#000000', 0.25, 4, 0),
  },

  buttonText: {
    ...fontFamily(600),
    color: COLORS.primary,
    fontSize: 18,
  },
});
