import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 22,
    paddingHorizontal: 24,
    paddingVertical: 32,

    borderColor: COLORS.borderOne,
  },

  leftOfCard: {},

  rightOfCard: {
    flex: 1,
    gap: 14,
  },

  requestText: {
    ...fontFamily(400),
    fontSize: 19,
  },
});
