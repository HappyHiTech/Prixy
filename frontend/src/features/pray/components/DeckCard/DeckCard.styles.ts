import { StyleSheet } from 'react-native';

import { DARK_COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFill,
    gap: 16,
    padding: 24,

    backgroundColor: DARK_COLORS.card,
    borderColor: DARK_COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },

  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,

    backgroundColor: DARK_COLORS.subtle,
    borderRadius: 22,
  },

  avatarText: {
    color: DARK_COLORS.text,
    ...fontFamily(600),
    fontSize: 15,
  },

  headerText: {
    flex: 1,
    gap: 2,
  },

  forLabel: {
    color: DARK_COLORS.mutedText,
    ...fontFamily(500),
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  prayeeName: {
    color: DARK_COLORS.text,
    ...fontFamily(600),
    fontSize: 20,
  },

  requestTextArea: {
    flex: 1,
    overflow: 'hidden',
  },

  requestText: {
    color: DARK_COLORS.text,
    ...fontFamily(400),
  },

  requestTextLarge: {
    fontSize: 26,
    lineHeight: 36,
  },

  requestTextMedium: {
    fontSize: 21,
    lineHeight: 30,
  },

  requestTextSmall: {
    fontSize: 16,
    lineHeight: 24,
  },

  footer: {
    gap: 6,
  },

  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  footerItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  footerText: {
    color: DARK_COLORS.mutedText,
    ...fontFamily(500),
    fontSize: 12,
  },

  // flexShrink lets the text give up width (and truncate) instead of
  // overflowing the row it sits in next to the icon.
  categoryText: {
    flexShrink: 1,
  },

  // Both stamps share the top-right corner (only one is ever visible) and
  // fade in while dragging so the user reads the outcome before letting go.
  // The card-colored background masks a long prayee name underneath.
  stamp: {
    position: 'absolute',
    right: 16,
    top: 30,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,

    backgroundColor: DARK_COLORS.card,
    borderRadius: 8,
  },

  stampText: {
    ...fontFamily(600),
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
