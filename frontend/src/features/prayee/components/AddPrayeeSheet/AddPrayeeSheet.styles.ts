import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    color: COLORS.secondaryText,
    fontSize: 12,
    letterSpacing: 0.5,
    ...fontFamily(600),
  },

  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.borderOne,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.primaryText,
    fontSize: 16,
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
