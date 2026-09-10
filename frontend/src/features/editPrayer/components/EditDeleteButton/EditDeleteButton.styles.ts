import { StyleSheet } from 'react-native';

import { dropShadow, fontFamily, COLORS } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  button: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    paddingVertical: 13,
    width: 332,
    backgroundColor: COLORS.danger,
    borderRadius: 30,
    ...dropShadow('#000000', 0.25, 4, 0),
  },

  text: {
    ...fontFamily(800),
    color: COLORS.primary,
    fontSize: 17,
  },
});
