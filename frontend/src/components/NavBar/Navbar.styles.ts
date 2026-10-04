import { StyleSheet } from 'react-native';

import { COLORS, dropShadow, fontFamily } from '@/constants';

export const INDICATOR_WIDTH = 44;

export const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 110,
    height: 85,
    backgroundColor: COLORS.primary,

    ...dropShadow('#000000', 0.25, 4, 0),
    flexDirection: 'row',
  },

  navButton: {
    position: 'relative',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  navButtonAdd: {
    position: 'relative',
    zIndex: 10,
    alignItems: 'center',
  },

  indicator: {
    left: 0,
    position: 'absolute',
    top: 0,
    height: 3,
    width: INDICATOR_WIDTH,
    backgroundColor: COLORS.accent,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },

  iconOverlay: {
    ...StyleSheet.absoluteFill,
  },

  navButtonText: {
    ...fontFamily(500),
    color: COLORS.secondaryText,
  },

  addPrayer: {
    position: 'absolute',
    top: -45,
    height: 90,
    width: 90,
    backgroundColor: COLORS.accent,
    borderColor: COLORS.primary,
    ...dropShadow('#000000', 0.25, 4, 0),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    borderWidth: 5,
  },
});
