import { StyleSheet } from 'react-native';

import { COLORS } from '@/constants';

export const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  option: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    width: 52,
    backgroundColor: COLORS.primaryBg,
    borderColor: 'transparent',
    borderRadius: 26,
    borderWidth: 2,
  },

  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
  },
});
