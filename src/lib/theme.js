import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";

export const PALETTES = {
  light: {
    background: "#F3F8F4",
    foreground: "#17201C",
    card: "#FFFFFF",
    cardForeground: "#17201C",
    primary: "#25745A",
    primaryForeground: "#FFFFFF",
    secondary: "#E7F0E9",
    secondaryForeground: "#193C32",
    muted: "#E7F0E9",
    mutedForeground: "#5D786C",
    border: "#D9E5DC",
    destructive: "#C93232",
    destructiveForeground: "#FFFFFF",
    warning: "#B96B13",
  },
  dark: {
    background: "#0D1713",
    foreground: "#EDF5F0",
    card: "#14231D",
    cardForeground: "#EDF5F0",
    primary: "#5FC29D",
    primaryForeground: "#07110D",
    secondary: "#1C342A",
    secondaryForeground: "#EDF5F0",
    muted: "#1A2D25",
    mutedForeground: "#A6BDB3",
    border: "#2A4438",
    destructive: "#F06A6A",
    destructiveForeground: "#0D1713",
    warning: "#F2A65A",
  },
};

export function getNavigationTheme(mode) {
  const palette = PALETTES[mode];
  return {
    dark: mode === "dark",
    colors: {
      primary: palette.primary,
      background: palette.background,
      card: palette.card,
      text: palette.foreground,
      border: palette.border,
      notification: palette.destructive,
    },
    fonts: {
      regular: { fontFamily: "System", fontWeight: "400" },
      medium: { fontFamily: "System", fontWeight: "500" },
      bold: { fontFamily: "System", fontWeight: "700" },
      heavy: { fontFamily: "System", fontWeight: "800" },
    },
  };
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const initialSystemTheme =
    Appearance.getColorScheme() === "dark" ? "dark" : "light";
  const [preference, setPreferenceState] = useState("system");
  const [systemScheme, setSystemScheme] = useState(initialSystemTheme);
  const { setColorScheme } = useNativeWindColorScheme();
  const resolvedTheme = preference === "system" ? systemScheme : preference;

  useEffect(() => {
    AsyncStorage.getItem("appearancePreference")
      .then((value) => {
        if (["system", "light", "dark"].includes(value)) {
          setPreferenceState(value);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setColorScheme(resolvedTheme);
  }, [resolvedTheme, setColorScheme]);

  const setPreference = useCallback((value) => {
    if (!["system", "light", "dark"].includes(value)) return;
    setPreferenceState(value);
    AsyncStorage.setItem("appearancePreference", value).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      palette: PALETTES[resolvedTheme],
      setPreference,
    }),
    [preference, resolvedTheme, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
