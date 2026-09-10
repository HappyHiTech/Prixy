import { StyleSheet } from 'react-native';

import { dropShadow, fontFamily, COLORS } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
  },

  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 13,
    width: 332,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    ...dropShadow('#000000', 0.25, 4, 0),
  },

  cardPressed: {
    opacity: 0.6,
  },

  text: {
    ...fontFamily(800),
    color: COLORS.dangerText,
    fontSize: 17,
  },
});
