import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },

  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 999,
  },

  text: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: COLORS.primary,
    fontSize: 15,
    ...fontFamily(700),
  },
});
