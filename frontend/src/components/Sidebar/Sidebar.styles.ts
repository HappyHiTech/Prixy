import { StyleSheet } from 'react-native';

import { COLORS, fontFamily, dropShadow } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    inset: 0,
    position: 'absolute',
    backgroundColor: COLORS.tint,

    zIndex: 100,
  },

  sideBar: {
    flex: 1,
    width: 250,
    backgroundColor: 'white',
  },

  header: {
    marginTop: 70,
    paddingHorizontal: 12,

    color: COLORS.accent,
    ...fontFamily(800),
    fontSize: 24,
  },

  addContainer: {
    marginTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: COLORS.borderOne,
    paddingHorizontal: 12,
  },

  add: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 7,
    ...dropShadow('#000000', 0.12, 4, 0),
  },

  addPressed: {
    opacity: 0.6,
  },

  addText: {
    color: '#9CA3AF',
  },

  selections: {},
});
