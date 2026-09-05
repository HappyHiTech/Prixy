import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'space-between',
    paddingBottom: 90,
    paddingHorizontal: 20,
    paddingTop: 65,
    backgroundColor: COLORS.primary,
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

  inputContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 15,
  },

  input: {
    height: 65,
    marginTop: 30,
    width: 43,
    backgroundColor: COLORS.primaryBg,

    borderRadius: 10,
    color: COLORS.primaryText,
    fontSize: 20,
    ...fontFamily(800),

    textAlign: 'center',
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
