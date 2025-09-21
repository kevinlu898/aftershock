import { StyleSheet } from 'react-native';

const colors = {
  primary: '#519872',   // sea green from your palette
  secondary: '#3B5249', // feldgrau
  accent: '#34252F',    // raisin black
  light: '#BEC5AD',     // ash gray
  muted: '#A4B494',     // sage
  danger: 'red',
  info: 'blue',
};

const fontSizes = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
};

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.light,
    textAlign: 'center',
  },
  heading: {
    fontSize: fontSizes.xlarge,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  subheading: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    color: colors.secondary,
    textAlign: 'center',
  },
  text: {
    fontSize: fontSizes.medium,
    color: colors.accent,
    textAlign: 'center',
  },
  red: {
    color: colors.danger,
  },
});

export { colors, fontSizes, globalStyles };
