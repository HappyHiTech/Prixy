import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 20,

    paddingTop: 70,
    backgroundColor: COLORS.primaryBg,
  },

  header: {
    alignItems: 'center',

    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,

  },

  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    borderWidth: 2,
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 52,
  },

  body: {
    alignSelf: 'stretch',
    flex: 1,
  },

  bodyContent: {
    gap: 8,
    paddingBottom: 140,
    paddingHorizontal: 22,
  },
});
