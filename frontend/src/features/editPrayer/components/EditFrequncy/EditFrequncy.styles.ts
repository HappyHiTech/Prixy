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

  // Inset accent outline. Every side is set explicitly so it overrides the
  // grid's per-side hairline borders.
  optionDormant: {
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: COLORS.accent,
    borderRightColor: COLORS.accent,
    borderBottomColor: COLORS.accent,
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
    color: COLORS.secondaryText,
  },

  optionSubtext: {
    ...fontFamily(500),
    marginTop: 2,
    color: COLORS.secondaryText,
    fontSize: 11,
    textAlign: 'center',
  },

  optionSubtextSelected: {
    color: COLORS.primary,
  },
});
