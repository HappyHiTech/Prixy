import { StyleSheet } from 'react-native';

import { COLORS } from '@/constants';

export const COLUMNS = 5;
export const GAP = 12;

export const styles = StyleSheet.create({
  container: {
    gap: GAP,
  },

  grid: {
    flexDirection: 'row',
    gap: GAP,
  },

  spacer: {
    flexBasis: 0,
    flexGrow: 1,
  },

  option: {
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: 0,
    flexGrow: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.primaryBg,
    borderColor: 'transparent',
    borderRadius: 999,
    borderWidth: 2,
  },

  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
  },
});
