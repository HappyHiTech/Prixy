import { StyleSheet } from 'react-native';

import { COLORS, dropShadow, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    padding: 24,
  },

  card: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 55,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    ...dropShadow('#000000', 0.25, 4, 0),
  },

  text: {
    ...fontFamily(300),

    color: COLORS.primaryText,
    fontSize: 19,

    textAlign: 'center',
  },

  placeholder: {
    color: COLORS.secondaryText,
  },

  edit: {
    position: 'absolute',
    right: 15,
    top: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    width: 35,
    backgroundColor: '#D9D9D9',
    borderRadius: '50%',
  },
});
