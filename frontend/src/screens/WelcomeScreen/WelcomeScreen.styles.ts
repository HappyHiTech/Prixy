import { StyleSheet } from 'react-native';

import { COLORS, fontFamily, dropShadow } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 90,
    backgroundColor: COLORS.primary,
  },

  title: {
    color: COLORS.accent,
    fontSize: 115,
  },

  startedButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 76,

    width: 308,
    backgroundColor: COLORS.accent,
    borderRadius: 87,
    ...dropShadow('#000000', 0.25, 4, 0),
  },

  startedText: {
    ...fontFamily(600),
    color: COLORS.primary,
    fontSize: 18,
  },
});
