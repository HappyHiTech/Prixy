import { StyleSheet } from 'react-native';

import { COLORS } from '@/constants';

/** Icons per row. Circle width is derived from this via flexBasis. */
export const COLUMNS = 5;
export const GAP = 12;

/**
 * The row is a fixed COLUMNS-wide flex line: `gap` reserves the gutters and
 * each circle grows into an equal share of what's left, so the row spans the
 * full width on any screen with no width math.
 *
 * `aspectRatio` is what gives a circle its height, and it must come from
 * style rather than a measured value — sizing these from an onLayout
 * measurement leaves the grid zero-height on the first pass, and the parent
 * sheet then sizes itself as if the icons weren't there.
 */
export const styles = StyleSheet.create({
  container: {
    gap: GAP,
  },

  grid: {
    flexDirection: 'row',
    gap: GAP,
  },

  spacer: {
    flexBasis: 0,
    flexGrow: 1,
  },

  option: {
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: 0,
    flexGrow: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.primaryBg,
    borderColor: 'transparent',
    borderRadius: 999,
    borderWidth: 2,
  },

  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
  },
});
