import { StyleSheet } from 'react-native';

import { COLORS, dropShadow, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    inset: 0,
    zIndex: 100,
    backgroundColor: COLORS.tint,

    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  actionButton: {
    height: 154,
    marginBottom: 120,
    width: 327,
    ...dropShadow('#000000', 0.15, 12, 4),
  },

  shape: {
    left: 0,
    position: 'absolute',
    top: 0,
  },

  content: {
    gap: 2,
    paddingBottom: 34,

    paddingTop: 24,
    borderColor: 'blue',
  },

  option: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 30,
    paddingVertical: 9,
  },

  text: {
    ...fontFamily(400),
    fontSize: 20,
  },
});
