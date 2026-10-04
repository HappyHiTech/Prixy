import { StyleSheet } from 'react-native';

import { COLORS, fontFamily, dropShadow } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 9,
  },

  textBody: {
    ...dropShadow('#000000', 0.25, 4, 0),
    ...fontFamily(300),

    maxHeight: 650,
    minHeight: 300,
    padding: 16,

    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,

    color: COLORS.primaryText,
    fontSize: 17,
    lineHeight: 24,
  },
});
