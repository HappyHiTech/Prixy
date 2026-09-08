import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 19,
    paddingHorizontal: 22,
    paddingTop: 65,
    borderWidth: 2,
  },

  title: {
    color: COLORS.accent,
    ...fontFamily(800),
    fontSize: 25,
  },
});
