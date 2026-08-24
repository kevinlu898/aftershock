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
import { PALETTES } from "./palette";

export { PALETTES };

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
