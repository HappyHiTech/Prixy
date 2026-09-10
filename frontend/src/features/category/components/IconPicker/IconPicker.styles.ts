import { StyleSheet } from 'react-native';

import { COLORS } from '@/constants';

export const COLUMNS = 5;
export const GAP = 12;

export const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },

  option: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryBg,
    borderColor: 'transparent',
    borderWidth: 2,
  },

  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
  },
});
