import { StyleSheet } from 'react-native';

import { COLORS, fontFamily, dropShadow } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 15,
    height: 74,
    paddingHorizontal: 15,
    width: 170,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    ...dropShadow('#000000', 0.25, 4, 0),
    flexDirection: 'row',
  },

  text: {
    ...fontFamily(400),
    flexShrink: 1,
    color: COLORS.secondary,
    fontSize: 15,
  },
});
