import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 12,
  },

  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  pressed: {
    opacity: 0.6,
  },

  text: {
    ...fontFamily(400),

    flexShrink: 1,

    color: COLORS.primaryText,
    fontSize: 17,
  },

  delete: {
    padding: 4,
  },
});
