import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingHorizontal: 22,
    paddingTop: 65,
  },

  title: {
    color: COLORS.accent,
    ...fontFamily(800),
    fontSize: 25,
  },
});
