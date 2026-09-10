import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  body: {
    marginHorizontal: 20,
    marginTop: 18,
  },

  preview: {
    alignItems: 'center',
    marginBottom: 20,
  },

  label: {
    marginBottom: 8,
    color: COLORS.secondaryText,
    fontSize: 12,
    letterSpacing: 0.5,
    ...fontFamily(600),
  },

  input: {
    ...fontFamily(300),

    padding: 14,

    backgroundColor: COLORS.primaryBg,

    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.primaryText,
    fontSize: 17,
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  error: {
    marginTop: 8,
    color: COLORS.dangerText,
    fontSize: 13,
  },

  iconSection: {
    marginTop: 24,
    paddingBottom: 8,
  },
});
