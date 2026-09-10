import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.tint,
  },

  keyboardView: {
    justifyContent: 'flex-end',
  },

  sheet: {
    paddingBottom: 30,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  handleArea: {
    alignItems: 'center',
    paddingBottom: 6,
    paddingTop: 10,
  },

  handle: {
    height: 5,
    width: 40,
    backgroundColor: COLORS.borderOne,
    borderRadius: 3,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: COLORS.borderOne,
  },

  title: {
    ...fontFamily(700),

    color: COLORS.accent,

    fontSize: 16,
  },

  action: {
    ...fontFamily(500),

    color: COLORS.accent,

    fontSize: 15,
  },

  actionDisabled: {
    color: COLORS.secondaryText,
  },

  actionButton: {
    minWidth: 60,
  },

  actionRight: {
    alignItems: 'flex-end',
  },
});
