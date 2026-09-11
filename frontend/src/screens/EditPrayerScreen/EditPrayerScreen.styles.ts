import { StyleSheet } from 'react-native';

import { COLORS, dropShadow, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },

  container2: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: COLORS.primaryBg,
  },

  body: {
    flex: 1,
  },

  errorText: {
    ...fontFamily(400),
    color: COLORS.secondaryText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  buttons: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    paddingHorizontal: 34,
  },

  backButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    ...dropShadow(COLORS.accent, 0.25, 6, 3),
  },

  backButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  backText: {
    ...fontFamily(600),
    color: COLORS.primary,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
