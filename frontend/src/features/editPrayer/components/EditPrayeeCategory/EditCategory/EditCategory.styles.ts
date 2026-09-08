import { StyleSheet } from 'react-native';

import { COLORS, fontFamily, dropShadow } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,

    justifyContent: 'center',
    height: 74,
    width: 170,

    backgroundColor: COLORS.primary,
    borderRadius: 15,

    ...dropShadow('#000000', 0.25, 4, 0),
  },

  text: {
    ...fontFamily(400),
    color: COLORS.secondary,

    fontSize: 15,
  },
});
