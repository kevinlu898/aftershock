import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Image, Platform, StatusBar, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: { outline: "home-outline", filled: "home" },
  Prepare: { outline: "clipboard-list-outline", filled: "clipboard-list" },
  Emergency: { outline: "alert-circle-outline", filled: "alert-circle" },
  Guide: { outline: require("./assets/images/outlineEpicenter.png"), filled: require("./assets/images/filledEpicenter1.png") },
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
            if (icon && (typeof icon === 'number' || typeof icon === 'object')) {
              return (
                <Image
                  source={icon}
                  style={{ width: 28, height: 28, tintColor: color, resizeMode: 'contain' }}
                />
              );
            }
            return (
              <MaterialCommunityIcons name={icon} color={color} size={28} />
            );
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
  return (
    <SafeAreaProvider>
      {/* Ensures consistent status bar background on both iOS + Android */}
      <StatusBar backgroundColor="#e7f0e7ff" barStyle="dark-content" />
      <ExpoStatusBar style="dark" backgroundColor="#e7f0e7ff" />

      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="AccountCreation" component={AccountCreation} />
          <Stack.Screen name="ChangeUsername" component={ChangeUsername} options={{ headerShown: true, title: 'Change Username' }} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: true, title: 'Change Password' }} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccount} options={{ headerShown: true, title: 'Delete Account' }} />
          <Stack.Screen name="TermsOfService" component={TermsOfService} options={{ headerShown: true, title: 'Terms of Service' }} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerShown: true, title: 'Privacy Policy' }} />
          <Stack.Screen name="ChangeDetails" component={ChangeDetails} options={{ headerShown: true, title: 'Change Details' }} />
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen name="prepareLessons" component={prepareLessons} />
          <Stack.Screen name="LocalRisk" component={LocalRisk} />
          <Stack.Screen name="News" component={News} />
          <Stack.Screen name="myPlan" component={myPlan} />
          <Stack.Screen name="medicalInfo" component={medicalInfo} />
          <Stack.Screen name="contactInfo" component={contactInfo} />
          <Stack.Screen name="importantDocuments" component={importantDocuments} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
