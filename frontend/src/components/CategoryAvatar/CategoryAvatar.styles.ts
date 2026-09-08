import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.borderOne,
    borderRadius: '50%',
  },

  icon: {
    color: COLORS.accent,
    ...fontFamily(800),
  },
});
