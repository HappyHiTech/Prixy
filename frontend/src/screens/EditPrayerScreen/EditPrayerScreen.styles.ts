import { StyleSheet } from 'react-native';

import { COLORS } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: COLORS.primaryBg,
  },

  container2: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    flex: 1,
  },
});
