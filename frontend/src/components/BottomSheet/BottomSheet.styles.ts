import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: COLORS.tint,
    justifyContent: 'flex-end',
  },

  sheet: {
    maxHeight: '85%',
    paddingBottom: 34,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderOne,
  },

  title: {
    color: COLORS.accent,
    ...fontFamily(800),
    fontSize: 17,
  },

  action: {
    minWidth: 60,
    color: COLORS.accent,
    fontSize: 16,
  },

  actionCancel: {
    color: COLORS.secondaryText,
    textAlign: 'left',
  },

  actionSave: {
    textAlign: 'right',
  },

  actionDisabled: {
    opacity: 0.35,
  },

  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
});
