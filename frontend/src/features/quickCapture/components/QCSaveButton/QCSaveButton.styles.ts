import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
  },

  button: {
    alignItems: 'center',
    minWidth: 64,
    backgroundColor: COLORS.accent,
    borderRadius: 999,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  text: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: COLORS.primary,
    fontSize: 15,
    ...fontFamily(700),
  },

  spinner: {
    paddingVertical: 8,
  },

  error: {
    marginBottom: 8,
    color: COLORS.dangerText,
    fontSize: 13,
    textAlign: 'right',
  },
});
