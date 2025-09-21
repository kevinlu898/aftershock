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
  xlarge: 30,
};

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.light,
  },
  heading: {
    fontSize: fontSizes.xlarge,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subheading: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    color: colors.secondary,
  },
  text: {
    fontSize: fontSizes.medium,
    color: colors.accent,
  },
  bigBlue: {
    color: colors.info,
    fontWeight: 'bold',
    fontSize: fontSizes.xlarge,
  },
  red: {
    color: colors.danger,
  },
});

export { colors, fontSizes, globalStyles };
