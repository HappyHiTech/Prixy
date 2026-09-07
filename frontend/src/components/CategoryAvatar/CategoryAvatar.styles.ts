import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
    width: 51,
    borderColor: COLORS.borderOne,
    borderRadius: '50%',
    borderWidth: 3,
  },

  icon: {
    color: COLORS.accent,
    ...fontFamily(800),
  },
});
