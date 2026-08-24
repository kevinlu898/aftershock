import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Image, Platform, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "../../components/app-icon";
import { useTheme } from "../../lib/theme";
import DashboardScreen from "../../screens/dashboard/DashboardScreen";
import EmergencyScreen from "../../screens/emergency/EmergencyScreen";
import EpicenterAIScreen from "../../screens/epicenter-ai/EpicenterAIScreen";
import PrepareScreen from "../../screens/prepare/PrepareScreen";
import ProfileScreen from "../../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: { outline: "home", filled: "home" },
  Prepare: { outline: "clipboard-list", filled: "clipboard-list" },
  Emergency: { outline: "alert-circle", filled: "alert-circle" },
  EpicenterAI: {
    outline: require("../../../assets/images/outlineEpicenter.png"),
    filled: require("../../../assets/images/filledEpicenter1.png"),
  },
  Profile: { outline: "account", filled: "account" },
};

const TAB_LABELS = {
  Dashboard: "Dashboard",
  Prepare: "Prepare",
  Emergency: "Emergency",
  EpicenterAI: "Epicenter AI",
  Profile: "Profile",
};

const TabIcon = ({ routeName, focused, color }) => {
  const iconSet = TAB_ICONS[routeName];
  const icon = focused ? iconSet?.filled : iconSet?.outline;

  const glyph =
    typeof icon === "string" ? (
      <AppIcon
        name={icon}
        color={color}
        size={24}
        strokeWidth={focused ? 2.6 : 2}
      />
    ) : icon ? (
      <Image
        source={icon}
        style={{ width: 26, height: 26, tintColor: color, resizeMode: "contain" }}
        accessibilityLabel=""
      />
    ) : null;

  return (
    <View
      className={[
        "h-9 min-w-[56px] items-center justify-center rounded-xl",
        focused ? "bg-secondary" : "bg-transparent",
      ].join(" ")}
      style={{ borderCurve: "continuous" }}
    >
      {glyph}
    </View>
  );
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
          tabBarShowLabel: false,
          tabBarIcon: (props) => <TabIcon routeName={route.name} {...props} />,
          tabBarAccessibilityLabel: TAB_LABELS[route.name],
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.mutedForeground,
          tabBarStyle: {
            backgroundColor: palette.card,
            borderTopWidth: 1,
            borderTopColor: palette.border,
            height: 58 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 6,
          },
          tabBarItemStyle: { borderRadius: 14 },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
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
