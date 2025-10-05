import { Platform, StyleSheet } from 'react-native';

const colors = {
  primary: '#519872',   // sea green from your palette
  secondary: '#445c52ff', // feldgrau
  accent: '#34252F',    // raisin black
  light: '#dae7daff',     // ash gray
  muted: '#A4B494',     // sage 
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
  // Existing styles
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

  // NEW: Safe area styles for all pages
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  // NEW: Status bar background protection for iOS
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 44 : 0, // Height for iOS status bar area
    backgroundColor: colors.white,
    zIndex: 9999,
  },

  // NEW: Scroll container with safe area padding
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },

  // NEW: Header styles (optional - if you want consistent headers)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    color: colors.secondary,
  },
  headerButton: {
    padding: 8,
  },

  // NEW: Page content area
  contentArea: {
    flex: 1,
    padding: 16,
  },
});

// NEW: Export platform-specific values
const platform = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  statusBarHeight: Platform.OS === 'ios' ? 44 : 0,
};

export { colors, fontSizes, globalStyles, platform };
