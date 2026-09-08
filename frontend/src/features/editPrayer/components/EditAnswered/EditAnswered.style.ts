import { StyleSheet } from 'react-native';

import { COLORS, dropShadow, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  pill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    paddingVertical: 13,
    width: 332,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    ...dropShadow('#000000', 0.25, 4, 0),
  },

  text: {
    ...fontFamily(800),
    color: COLORS.accent,
    fontSize: 17,
  },

  pillAnswered: {
    backgroundColor: COLORS.accent,
  },

  textAnswered: {
    color: COLORS.primary,
  },
});
