import { NavigationContainer } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import EmergencyBanner from "../components/EmergencyBanner";
import { useEarthquakeAlert } from "../hooks/useEarthquakeAlert";
import { migrateLegacyStorageKeys } from "../lib/storage/migrations";
import { getNavigationTheme, ThemeProvider, useTheme } from "../lib/theme";
import RootNavigator from "./navigation/RootNavigator";
import { navigationRef } from "./navigation/navigationRef";

function ThemedApp() {
  const { isEmergency, lastEarthquakeTime } = useEarthquakeAlert();
  const { resolvedTheme, palette } = useTheme();

  useEffect(() => {
    migrateLegacyStorageKeys().catch((error) => {
      console.warn("Failed to migrate legacy storage keys", error);
    });
  }, []);

  const openEmergency = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate("MainApp", {
        screen: "Emergency",
      });
    }
  };

  return (
    <SafeAreaProvider>
      
      <ExpoStatusBar
        style={resolvedTheme === "dark" ? "light" : "dark"}
        backgroundColor={palette.background}
      />
      {isEmergency && (
        <EmergencyBanner
          lastEarthquakeTime={lastEarthquakeTime}
          onPress={openEmergency}
        />
      )}
      <NavigationContainer
        ref={navigationRef}
        theme={getNavigationTheme(resolvedTheme)}
      >
        <RootNavigator />
      </NavigationContainer>
      <PortalHost />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
