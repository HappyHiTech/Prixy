import { StyleSheet } from 'react-native';

import { COLORS, dropShadow, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',

    paddingVertical: 13,
    width: 160,

    backgroundColor: COLORS.primary,
    borderRadius: 30,
    ...dropShadow('#000000', 0.25, 4, 0),
  },

  saveText: {
    ...fontFamily(800),
    color: COLORS.primaryText,
    fontSize: 17,
  },
});
