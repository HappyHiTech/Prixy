import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  list: {
    maxHeight: 400,
  },

  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  pressed: {
    opacity: 0.6,
  },

  rowText: {
    ...fontFamily(400),
    flex: 1,
    color: COLORS.primaryText,
    fontSize: 17,
  },

  check: {
    width: 20,
  },

  message: {
    ...fontFamily(400),
    padding: 20,
    color: COLORS.secondaryText,
    fontSize: 15,
  },

  spinner: {
    padding: 20,
  },
});
