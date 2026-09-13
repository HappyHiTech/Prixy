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
  dot: {
    height: 6,
    width: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },

  text: {
    ...fontFamily(600),
    color: COLORS.secondaryText,
    fontSize: 17,
  },

  textActive: {
    color: COLORS.accent,
  },

  icon: {
    color: COLORS.secondaryText,
  },
});
