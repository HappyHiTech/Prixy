import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  input: {
    ...fontFamily(300),

    fontSize: 17,
    lineHeight: 24,

    marginHorizontal: 20,
    marginTop: 18,
    padding: 14,
    minHeight: 160,

    color: COLORS.primaryText,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,

    textAlignVertical: 'top',
  },
});
