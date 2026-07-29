import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import LocalRiskScreen from "../../screens/dashboard/LocalRiskScreen";
import NewsScreen from "../../screens/dashboard/NewsScreen";
import HomeScreen from "../../screens/onboarding/HomeScreen";
import ContactInfoScreen from "../../screens/prepare/ContactInfoScreen";
import ImportantDocumentsScreen from "../../screens/prepare/ImportantDocumentsScreen";
import MedicalInfoScreen from "../../screens/prepare/MedicalInfoScreen";
import MyPlanScreen from "../../screens/prepare/MyPlanScreen";
import PrepareLessonScreen from "../../screens/prepare/PrepareLessonScreen";
import AccountCreationScreen from "../../screens/profile/AccountCreationScreen";
import ChangeDetailsScreen from "../../screens/profile/ChangeDetailsScreen";
import ChangePasswordScreen from "../../screens/profile/ChangePasswordScreen";
import ChangeUsernameScreen from "../../screens/profile/ChangeUsernameScreen";
import DeleteAccountScreen from "../../screens/profile/DeleteAccountScreen";
import ExportDataScreen from "../../screens/profile/ExportDataScreen";
import LoginScreen from "../../screens/profile/LoginScreen";
import PrivacyPolicyScreen from "../../screens/profile/PrivacyPolicyScreen";
import TermsOfServiceScreen from "../../screens/profile/TermsOfServiceScreen";
import MainTabNavigator from "./MainTabNavigator";
import { useTheme } from "../../lib/theme";
import { Icon } from "../../components/ui/icon";

const Stack = createNativeStackNavigator();

const SCREENS = [
  ["Home", HomeScreen, { headerShown: false }],
  ["Login", LoginScreen, { headerShown: false }],
  ["AccountCreation", AccountCreationScreen, { headerShown: false, title: "Create Account" }],
  ["ChangeUsername", ChangeUsernameScreen, { title: "Change Username" }],
  ["ChangePassword", ChangePasswordScreen, { title: "Change Password" }],
  ["DeleteAccount", DeleteAccountScreen, { title: "Delete Account" }],
  ["TermsOfService", TermsOfServiceScreen, { title: "Terms of Service" }],
  ["PrivacyPolicy", PrivacyPolicyScreen, { title: "Privacy Policy" }],
  ["ChangeDetails", ChangeDetailsScreen, { title: "My Details" }],
  ["MainApp", MainTabNavigator, { headerShown: false }],
  ["prepareLessons", PrepareLessonScreen, { headerShown: false }],
  ["LocalRisk", LocalRiskScreen, { title: "Local Risk" }],
  ["News", NewsScreen, { title: "Earthquake News" }],
  ["myPlan", MyPlanScreen, { title: "My Plan" }],
  ["medicalInfo", MedicalInfoScreen, { title: "Medical Information" }],
  ["contactInfo", ContactInfoScreen, { title: "Emergency Contacts" }],
  ["ExportData", ExportDataScreen, { title: "Export Data" }],
  ["importantDocuments", ImportantDocumentsScreen, { title: "Important Documents" }],
];

export default function RootNavigator() {
  const { palette } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerBackButtonDisplayMode: "minimal",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.primary,
        headerTitleStyle: {
          color: palette.foreground,
          fontSize: 18,
          fontWeight: "700",
        },
        contentStyle: { backgroundColor: palette.background },
        headerLeft: () =>
          navigation.canGoBack() ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              onPress={() => navigation.goBack()}
              style={({ pressed }) => ({
                marginRight: 8,
                opacity: pressed ? 0.55 : 1,
                padding: 4,
              })}
            >
              <Icon as={ArrowLeft} size={23} color={palette.primary} />
            </Pressable>
          ) : null,
      })}
    >
      {SCREENS.map(([name, component, options]) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
          options={options}
        />
      ))}
    </Stack.Navigator>
  );
}
