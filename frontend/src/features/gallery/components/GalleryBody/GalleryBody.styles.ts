import { StyleSheet } from 'react-native';

import { COLORS, fontFamily, dropShadow } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },

  subText: {
    paddingHorizontal: 24,

    ...fontFamily(600),

    color: COLORS.secondaryText,
    fontSize: 13,
  },

  list: {
    flex: 1,

    marginTop: 8,

    minHeight: 600,
    paddingHorizontal: 24,
  },

  listContent: {
    paddingBottom: 120,
  },

  reqWrapper: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    ...dropShadow('#000', 0.15, 2, 0),
  },

  stateIndicator: {
    marginTop: 40,
  },

  stateText: {
    ...fontFamily(400),
    marginTop: 40,
    paddingHorizontal: 24,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
});
