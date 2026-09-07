import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  text: {
    ...fontFamily(400),
    color: COLORS.primaryText,
    fontSize: 17,
  },
});
