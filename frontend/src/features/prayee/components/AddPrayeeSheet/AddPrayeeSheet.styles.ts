import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  label: {
    color: COLORS.secondaryText,
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
    ...fontFamily(600),
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.borderOne,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.primaryText,
    backgroundColor: COLORS.primaryBg,
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  error: {
    marginTop: 8,
    color: COLORS.dangerText,
    fontSize: 13,
  },
});
