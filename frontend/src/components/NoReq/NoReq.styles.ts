import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  message: {
    ...fontFamily(400),

    marginTop: 12,

    color: COLORS.secondaryText,
    fontSize: 14,
    textAlign: 'center',
  },
});
