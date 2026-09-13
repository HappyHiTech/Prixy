import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    gap: 3,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 17,
    paddingHorizontal: 17,
    borderColor: COLORS.borderOne,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 1,
    borderLeftWidth: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    ...fontFamily(600),
    color: COLORS.secondaryText,
    fontSize: 17,
  },

  icon: {
    color: COLORS.secondaryText,
  },
});
