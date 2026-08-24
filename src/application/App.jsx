import { NavigationContainer } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import EmergencyBanner from "../components/EmergencyBanner";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { FlashlightProvider } from "../components/ui/flashlight";
import { ToastProvider } from "../components/ui/toast";
import { useEarthquakeAlert } from "../hooks/useEarthquakeAlert";
import { migrateLegacyStorageKeys } from "../lib/storage/migrations";
import { getNavigationTheme, ThemeProvider, useTheme } from "../lib/theme";
import RootNavigator from "./navigation/RootNavigator";
import { navigationRef } from "./navigation/navigationRef";

function ThemedApp() {
  const { isEmergency, lastEarthquakeTime, magnitude, place, dismiss } =
    useEarthquakeAlert();
  const { resolvedTheme, palette } = useTheme();

  useEffect(() => {
    migrateLegacyStorageKeys().catch((error) => {
      console.warn("Failed to migrate legacy storage keys", error);
    });
  }, []);

  const openEmergency = (card) => {
    if (!navigationRef.isReady()) return;
    navigationRef.navigate("MainApp", {
      screen: "Emergency",
      params: card ? { card } : undefined,
    });
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const type = response?.notification?.request?.content?.data?.type;
        if (type === "earthquake-alert") openEmergency();
      }
    );
    return () => subscription.remove();
  }, []);

  return (
    <>
      <ExpoStatusBar
        style={resolvedTheme === "dark" ? "light" : "dark"}
        backgroundColor={palette.background}
      />
      {isEmergency && (
        <EmergencyBanner
          lastEarthquakeTime={lastEarthquakeTime}
          magnitude={magnitude}
          place={place}
          onPress={() => openEmergency()}
          onPressContacts={() => openEmergency("contacts")}
          onDismiss={dismiss}
        />
      )}
      <ErrorBoundary>
        <NavigationContainer
          ref={navigationRef}
          theme={getNavigationTheme(resolvedTheme)}
        >
          <RootNavigator />
        </NavigationContainer>
      </ErrorBoundary>
      <PortalHost />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <FlashlightProvider>
          <ToastProvider>
            <ThemedApp />
          </ToastProvider>
        </FlashlightProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
