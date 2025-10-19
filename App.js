import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Platform, StatusBar, View } from "react-native";
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
import Prepare from "./screens/Prepare/Prepare";
import prepareLessons from "./screens/Prepare/prepareLessons";
import AccountCreation from "./screens/Profile/AccountCreation";
import ChangePassword from "./screens/Profile/ChangePassword";
import ChangeUsername from "./screens/Profile/ChangeUsername";
import DeleteAccount from "./screens/Profile/DeleteAccount";
import Login from "./screens/Profile/Login";
import Profile from "./screens/Profile/Profile";
import TermsOfService from "./screens/TermsOfService";
import UserAgreement from "./screens/UserAgreement";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: { outline: "home-outline", filled: "home" },
  Prepare: { outline: "clipboard-list-outline", filled: "clipboard-list" },
  Emergency: { outline: "alert-circle-outline", filled: "alert-circle" },
  Guide: { outline: "message-question-outline", filled: "message-question" },
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
            const iconName = focused ? iconSet.filled : iconSet.outline;
            return (
              <MaterialCommunityIcons name={iconName} color={color} size={28} />
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
          <Stack.Screen name="UserAgreement" component={UserAgreement} options={{ headerShown: true, title: 'User Agreement' }} />
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen name="prepareLessons" component={prepareLessons} />
          <Stack.Screen name="LocalRisk" component={LocalRisk} />
          <Stack.Screen name="News" component={News} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
