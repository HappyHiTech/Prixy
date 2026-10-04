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

  chip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  },

  chipText: {
    color: DARK_COLORS.mutedText,
    ...fontFamily(500),
    fontSize: 13,
  },

  // overflow: hidden is a safety net so text past the smallest tier gets
  // clipped inside the card instead of spilling over the footer.
  requestText: {
    flex: 1,
    overflow: 'hidden',
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

  // The "stamp" fades in on the side the card is being dragged away from,
  // so the user reads the outcome before letting go.
  stamp: {
    position: 'absolute',
    top: 24,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  stampPrayed: {
    left: 24,
  },

  stampAgain: {
    right: 24,
  },

  stampText: {
    ...fontFamily(600),
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
