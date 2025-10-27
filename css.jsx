import { StyleSheet } from 'react-native';

const colors = {
  primary: '#498464ff',
  secondary: '#3a5247',
  accent: '#2c1e27',
  light: '#e7f0e7ff',
  muted: '#66a87dff',
  danger: 'red',
  white: '#ffffff',
  black: '#000000',
};

const fontSizes = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  heading: 32,
};

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: colors.light,
  },
  contentContainer: {
    alignItems: 'center',
    textAlign: 'center',
  },
  heading: {
    fontSize: fontSizes.heading,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 0,
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
  backButton: {
    marginTop: 30,
    marginBottom: 15,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff"
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: "700"
  },
  infoBox: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6EEF3',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
    color: '#111827',
  },
  inputLabel: {
    color: '#111827',
    marginBottom: 8,
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#498464ff',
    borderRadius: 10,
    marginTop: 4,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export { colors, fontSizes, globalStyles };
