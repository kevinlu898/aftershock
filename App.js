import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { fetchEarthquakeData } from "./requests";

import Dashboard from "./screens/Dashboard";
import LocalRisk from "./screens/Dashboard/LocalRisk";
import News from "./screens/Dashboard/News";
import Emergency from "./screens/Emergency/Emergency";
import Guide from "./screens/Guide/Guide";
import Home from "./screens/Home";
import contactInfo from "./screens/Prepare/contactInfo";
import importantDocuments from "./screens/Prepare/importantDocuments";
import medicalInfo from "./screens/Prepare/medicalInfo";
import myPlan from "./screens/Prepare/myPlan";
import Prepare from "./screens/Prepare/Prepare";
import prepareLessons from "./screens/Prepare/prepareLessons";
import AccountCreation from "./screens/Profile/AccountCreation";
import ChangeDetails from "./screens/Profile/ChangeDetails";
import ChangePassword from "./screens/Profile/ChangePassword";
import ChangeUsername from "./screens/Profile/ChangeUsername";
import DeleteAccount from "./screens/Profile/DeleteAccount";
import Login from "./screens/Profile/Login";
import PrivacyPolicy from "./screens/Profile/PrivacyPolicy";
import Profile from "./screens/Profile/Profile";
import TermsOfService from "./screens/Profile/TermsOfService";
// Try to load MaterialCommunityIcons at runtime (avoids a static module resolution error
// in environments where the package isn't installed). If unavailable, we'll render no icon.
let MaterialCommunityIcons = null;
try {
  const mod = require("react-native-vector-icons/MaterialCommunityIcons");
  MaterialCommunityIcons = mod && mod.default ? mod.default : mod;
} catch (_err) {
  MaterialCommunityIcons = null;
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navigation ref so non-screen components can navigate
export const navigationRef = createNavigationContainerRef();

// Global emergency banner shown at the top of the app
function EmergencyBanner({ lastEarthquakeTime }) {
  const insets = useSafeAreaInsets();

  const minutesAgo = (() => {
    if (!lastEarthquakeTime) return null;
    const then =
      typeof lastEarthquakeTime === "number"
        ? lastEarthquakeTime
        : Date.parse(lastEarthquakeTime);
    if (!then) return null;
    const diffMs = Date.now() - then;
    const mins = Math.max(0, Math.round(diffMs / (60 * 1000)));
    return mins;
  })();

  return (
    <View style={[styles.banner, { paddingTop: insets.top || 12 }]}>
      <Text style={styles.bannerText}>{"EMERGENCY ALERT"}</Text>
      {minutesAgo !== null ? (
        <Text
          style={styles.bannerSubtitle}
        >{`earthquake occurred near you around ${minutesAgo} minutes ago`}</Text>
      ) : (
        <Text style={styles.bannerSubtitle}>{"Go to Emergency page."}</Text>
      )}
      <TouchableOpacity
        onPress={() => {
          try {
            if (navigationRef.isReady()) {
              navigationRef.navigate("MainApp", { screen: "Emergency" });
            }
          } catch (e) {
            console.warn("Navigation to Emergency failed", e);
          }
        }}
      >
        <Text
          style={[styles.bannerSubtitle, { textDecorationLine: "underline" }]}
        >
          {"Open Emergency"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Wrapper to conditionally render the banner based on AsyncStorage
// (Emergency banner visibility is controlled by App-level state and persisted in AsyncStorage)

const TAB_ICONS = {
  Dashboard: { outline: "home-outline", filled: "home" },
  Prepare: { outline: "clipboard-list-outline", filled: "clipboard-list" },
  Emergency: { outline: "alert-circle-outline", filled: "alert-circle" },
  Guide: {
    outline: require("./assets/images/outlineEpicenter.png"),
    filled: require("./assets/images/filledEpicenter1.png"),
  },
  Profile: { outline: "account-outline", filled: "account" },
};

// Tabs Navigator
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#e7f0e7ff", // 💚 matches theme background
        paddingTop:
          Platform.OS === "android" ? StatusBar.currentHeight : insets.top,
      }}
    >
      {/* Controls status bar color */}
      <ExpoStatusBar style="dark" backgroundColor="#e7f0e7ff" />

      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color }) => {
            const iconSet = TAB_ICONS[route.name];
            const icon = focused ? iconSet.filled : iconSet.outline;
            // If icon is a bundled asset (require(...)) it may be a number (native) or an object (web) — render Image
            if (
              icon &&
              (typeof icon === "number" || typeof icon === "object")
            ) {
              return (
                <Image
                  source={icon}
                  style={{
                    width: 28,
                    height: 28,
                    tintColor: color,
                    resizeMode: "contain",
                  }}
                />
              );
            }
            if (typeof icon === "string") {
              return (
                <MaterialCommunityIcons name={icon} color={color} size={28} />
              );
            }
            return null;
          },
          tabBarActiveTintColor: "#519872",
          tabBarInactiveTintColor: "#3B5249",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            height: 80,
            paddingBottom: 20,
            paddingTop: 12,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Prepare" component={Prepare} />
        <Tab.Screen name="Emergency" component={Emergency} />
        <Tab.Screen name="Guide" component={Guide} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </View>
  );
}

// Root App
export default function App() {
  // App-level emergency state (reads from AsyncStorage on mount)
  const [emergencyState, setEmergencyState] = useState("no");
  const [lastEarthquakeTime, setLastEarthquakeTime] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadState = async () => {
      try {
        const raw = await AsyncStorage.getItem("emergencyState");
        const lastTime = await AsyncStorage.getItem("lastEarthquakeTime");
        if (!mounted) return;
        if (raw === null) {
          await AsyncStorage.setItem("emergencyState", "no");
          setEmergencyState("no");
        } else {
          setEmergencyState(raw);
        }
        if (lastTime) {
          setLastEarthquakeTime(lastTime);
          // If the last event is older than 20 minutes, clear emergency state
          try {
            const then = isNaN(Number(lastTime))
              ? Date.parse(lastTime)
              : Number(lastTime);
            if (then && Date.now() - then > 20 * 60 * 1000) {
              await AsyncStorage.setItem("emergencyState", "no");
              setEmergencyState("no");
            }
          } catch (_err) {
            // ignore parse errorsf
          }
        }
      } catch (e) {
        console.warn("Failed to read emergencyState", e);
      }
    };

    loadState();

    return () => {
      mounted = false;
    };
  }, []);

  // Polling: check for latest earthquake on mount and every 10 minutes
  useEffect(() => {
    let mounted = true;
    let intervalId = null;

    const computeFingerprint = (ev) => {
      if (!ev) return null;
      // Prefer an explicit id or fingerprint if present
      if (ev.id) return String(ev.id);
      if (ev.fingerprint) return String(ev.fingerprint);
      // Fallback: use place+time+mag
      return `${ev.place ?? ""}|${ev.time ?? ev.timeISO ?? ""}|${ev.mag ?? ""}`;
    };

    const checkOnce = async () => {
      try {
        const rawPostal = await AsyncStorage.getItem("postalcode");
        const postal = Number(rawPostal) || undefined;
        const data = await fetchEarthquakeData(postal);
        const latest = data?.results?.[0] || data?.data?.[0] || null;
        console.log("83094820948230948230492840923840928434042420");
        console.log("the latest earthquake data:", latest);
        const fingerprint = computeFingerprint(latest);
        // Attempt to capture and persist timestamp of latest event if present
        const latestTime = latest?.time || latest?.timeISO || null;
        if (latestTime) {
          const timeVal =
            typeof latestTime === "number"
              ? String(latestTime)
              : String(latestTime);
          await AsyncStorage.setItem("lastEarthquakeTime", timeVal);
          setLastEarthquakeTime(timeVal);
        }

        const prev = await AsyncStorage.getItem("lastEarthquakeFingerprint");
        if (!mounted) return;

        if (fingerprint && prev && fingerprint !== prev) {
          // new earthquake
          await AsyncStorage.setItem("lastEarthquakeFingerprint", fingerprint);
          await AsyncStorage.setItem("emergencyState", "yes");
          setEmergencyState("yes");
        } else if (fingerprint && !prev) {
          console.log("Setting initial earthquake fingerprint");
          await AsyncStorage.setItem("emergencyState", "yes");
          setEmergencyState("yes");
          // first-time populate fingerprint but don't set emergency unless data indicates event >= threshold
          await AsyncStorage.setItem("lastEarthquakeFingerprint", fingerprint);
          // keep emergency as-is (do not flip to yes just because we populated initial state)
        } else if (!fingerprint) {
          // no events — clear emergency
          await AsyncStorage.setItem("emergencyState", "no");
          setEmergencyState("no");
        }
      } catch (e) {
        console.warn("Earthquake polling error", e);
      }
    };

    // initial check
    checkOnce();

    // every 10 minutes
    intervalId = setInterval(checkOnce, 10 * 60 * 1000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <SafeAreaProvider>
      {/* Ensures consistent status bar background on both iOS + Android */}
      <StatusBar backgroundColor="#e7f0e7ff" barStyle="dark-content" />
      <ExpoStatusBar style="dark" backgroundColor="#e7f0e7ff" />

      {emergencyState === "yes" && (
        <EmergencyBanner lastEarthquakeTime={lastEarthquakeTime} />
      )}

      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="AccountCreation" component={AccountCreation} />
          <Stack.Screen
            name="ChangeUsername"
            component={ChangeUsername}
            options={{ headerShown: true, title: "Change Username" }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePassword}
            options={{ headerShown: true, title: "Change Password" }}
          />
          <Stack.Screen
            name="DeleteAccount"
            component={DeleteAccount}
            options={{ headerShown: true, title: "Delete Account" }}
          />
          <Stack.Screen
            name="TermsOfService"
            component={TermsOfService}
            options={{ headerShown: true, title: "Terms of Service" }}
          />
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicy}
            options={{ headerShown: true, title: "Privacy Policy" }}
          />
          <Stack.Screen
            name="ChangeDetails"
            component={ChangeDetails}
            options={{ headerShown: true, title: "Change Details" }}
          />
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen name="prepareLessons" component={prepareLessons} />
          <Stack.Screen name="LocalRisk" component={LocalRisk} />
          <Stack.Screen name="News" component={News} />
          <Stack.Screen name="myPlan" component={myPlan} />
          <Stack.Screen name="medicalInfo" component={medicalInfo} />
          <Stack.Screen name="contactInfo" component={contactInfo} />
          <Stack.Screen
            name="importantDocuments"
            component={importantDocuments}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#b91c1c", // red but slightly muted to fit palette
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    zIndex: 999,
    elevation: 6,
  },
  bannerText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 16,
  },
  bannerSubtitle: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },
});
