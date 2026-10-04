import { StyleSheet } from 'react-native';

import { COLORS, fontFamily, dropShadow } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 15,
  },

  header: {
    ...fontFamily(800),
    fontSize: 17,
  },

  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    ...dropShadow('#000000', 0.25, 4, 0),
  },

  option: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
    width: '25%',
  },

  optionBorderRight: {
    borderRightWidth: 1,
    borderRightColor: COLORS.borderOne,
  },

  optionBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderOne,
  },

  optionSelected: {
    backgroundColor: COLORS.accent,
  },

  optionDormant: {
    backgroundColor: COLORS.accentTint,
  },

  // The sublabel adds a line, so trim padding to keep both rows equal height.
  optionWithSubtext: {
    paddingVertical: 16,
  },

  optionText: {
    ...fontFamily(800),
    color: COLORS.secondary,
    fontSize: 15,
  },

  optionTextSelected: {
    color: COLORS.primary,
  },

  optionTextDormant: {
    color: COLORS.accent,
  },

  optionSubtext: {
    ...fontFamily(500),
    marginTop: 2,
    color: COLORS.secondaryText,
    fontSize: 11,
    textAlign: 'center',
  },
});
