import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Image, Platform, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../lib/theme";
import DashboardScreen from "../../screens/dashboard/DashboardScreen";
import EmergencyScreen from "../../screens/emergency/EmergencyScreen";
import EpicenterAIScreen from "../../screens/epicenter-ai/EpicenterAIScreen";
import PrepareScreen from "../../screens/prepare/PrepareScreen";
import ProfileScreen from "../../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: { outline: "home-outline", filled: "home" },
  Prepare: {
    outline: "clipboard-list-outline",
    filled: "clipboard-list",
  },
  Emergency: {
    outline: "alert-circle-outline",
    filled: "alert-circle",
  },
  EpicenterAI: {
    outline: require("../../../assets/images/outlineEpicenter.png"),
    filled: require("../../../assets/images/filledEpicenter1.png"),
  },
  Profile: { outline: "account-outline", filled: "account" },
};

const TabIcon = ({ routeName, focused, color }) => {
  const iconSet = TAB_ICONS[routeName];
  const icon = focused ? iconSet?.filled : iconSet?.outline;

  if (typeof icon === "string") {
    return <MaterialCommunityIcons name={icon} color={color} size={28} />;
  }
  if (icon) {
    return (
      <Image
        source={icon}
        style={{ width: 28, height: 28, tintColor: color, resizeMode: "contain" }}
      />
    );
  }
  return null;
};

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme, palette } = useTheme();

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop:
          Platform.OS === "android" ? StatusBar.currentHeight : insets.top,
      }}
    >
      <ExpoStatusBar
        style={resolvedTheme === "dark" ? "light" : "dark"}
        backgroundColor={palette.background}
      />
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: (props) => (
            <TabIcon routeName={route.name} {...props} />
          ),
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.mutedForeground,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 1 },
          tabBarStyle: {
            backgroundColor: palette.card,
            borderTopWidth: 1,
            borderTopColor: palette.border,
            height: 72 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 8,
          },
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
        />
        <Tab.Screen name="Prepare" component={PrepareScreen} />
        <Tab.Screen name="Emergency" component={EmergencyScreen} />
        <Tab.Screen
          name="EpicenterAI"
          component={EpicenterAIScreen}
          options={{ title: "Epicenter AI" }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}
