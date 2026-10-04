import { StyleSheet } from 'react-native';

import { DARK_COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  iconRing: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
    marginBottom: 8,
    width: 72,

    backgroundColor: DARK_COLORS.subtle,
    borderRadius: 36,
  },

  title: {
    color: DARK_COLORS.text,
    ...fontFamily(700),
    fontSize: 26,
  },

  body: {
    color: DARK_COLORS.mutedText,

    textAlign: 'center',
    ...fontFamily(500),
    fontSize: 15,
    lineHeight: 22,
  },
});
