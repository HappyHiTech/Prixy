import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 90,
    paddingHorizontal: 20,
    paddingTop: 65,
  },

  header: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 25,
    width: 356,
  },

  headerText: {
    color: COLORS.primaryText,
    ...fontFamily(500),
    fontSize: 35,
    textAlign: 'center',
  },

  input: {
    alignSelf: 'center',
    height: 65,
    marginTop: 30,
    padding: 22,
    width: 346,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 10,
  },

  subtitle: {
    alignSelf: 'center',
    marginTop: 18,
    color: '#979797',
  },

  primaryButton: {
    alignSelf: 'center',
  },
});
