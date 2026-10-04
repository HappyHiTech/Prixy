import { StyleSheet } from 'react-native';

import { DARK_COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 20,
    paddingTop: 70,

    backgroundColor: DARK_COLORS.bg,
  },

  header: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },

  progressTrack: {
    alignSelf: 'stretch',
    height: 2,
    marginHorizontal: 22,
    overflow: 'hidden',

    backgroundColor: DARK_COLORS.border,
    borderRadius: 2,
  },

  progressFill: {
    height: '100%',

    backgroundColor: DARK_COLORS.mutedText,
    borderRadius: 2,
  },

  body: {
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 109,
    paddingHorizontal: 22,
    paddingTop: 8,
  },

  message: {
    alignItems: 'center',
    gap: 16,
  },

  messageText: {
    color: DARK_COLORS.mutedText,
    ...fontFamily(500),
    fontSize: 15,
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,

    borderColor: DARK_COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
  },

  retryText: {
    color: DARK_COLORS.text,
    ...fontFamily(600),
    fontSize: 14,
  },
});
