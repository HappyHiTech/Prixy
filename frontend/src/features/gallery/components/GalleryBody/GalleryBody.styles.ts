import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
  },

  subText: {
    ...fontFamily(600),
    color: COLORS.secondaryText,
    fontSize: 13,
  },
});
