import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LocalRiskScreen from "../../screens/dashboard/LocalRiskScreen";
import NewsScreen from "../../screens/dashboard/NewsScreen";
import BootGateScreen from "../../screens/onboarding/BootGateScreen";
import HomeScreen from "../../screens/onboarding/HomeScreen";
import OnboardingScreen from "../../screens/onboarding/OnboardingScreen";
import ContactInfoScreen from "../../screens/prepare/ContactInfoScreen";
import ImportantDocumentsScreen from "../../screens/prepare/ImportantDocumentsScreen";
import MedicalInfoScreen from "../../screens/prepare/MedicalInfoScreen";
import MyPlanScreen from "../../screens/prepare/MyPlanScreen";
import PrepareLessonScreen from "../../screens/prepare/PrepareLessonScreen";
import AccountCreationScreen from "../../screens/profile/AccountCreationScreen";
import ChangeDetailsScreen from "../../screens/profile/ChangeDetailsScreen";
import ChangePasswordScreen from "../../screens/profile/ChangePasswordScreen";
import ChangeUsernameScreen from "../../screens/profile/ChangeUsernameScreen";
import ConfirmPasswordScreen from "../../screens/profile/ConfirmPasswordScreen";
import DeleteAccountScreen from "../../screens/profile/DeleteAccountScreen";
import ExportDataScreen from "../../screens/profile/ExportDataScreen";
import LoginScreen from "../../screens/profile/LoginScreen";
import PrivacyPolicyScreen from "../../screens/profile/PrivacyPolicyScreen";
import TermsOfServiceScreen from "../../screens/profile/TermsOfServiceScreen";
import MainTabNavigator from "./MainTabNavigator";
import { useTheme } from "../../lib/theme";

const Stack = createNativeStackNavigator();

const SCREENS = [
  ["BootGate", BootGateScreen, { headerShown: false }],
  ["Home", HomeScreen, { headerShown: false }],
  ["Onboarding", OnboardingScreen, { headerShown: false, gestureEnabled: false }],
  ["Login", LoginScreen, { headerShown: false }],
  ["AccountCreation", AccountCreationScreen, { headerShown: false, title: "Create Account" }],
  ["ChangeUsername", ChangeUsernameScreen, { title: "Change Username" }],
  ["ConfirmPassword", ConfirmPasswordScreen, { title: "Confirm Password" }],
  ["ChangePassword", ChangePasswordScreen, { title: "Change Password" }],
  ["DeleteAccount", DeleteAccountScreen, { title: "Delete Account" }],
  ["TermsOfService", TermsOfServiceScreen, { title: "Terms of Service" }],
  ["PrivacyPolicy", PrivacyPolicyScreen, { title: "Privacy Policy" }],
  ["ChangeDetails", ChangeDetailsScreen, { title: "My Details" }],
  ["MainApp", MainTabNavigator, { headerShown: false }],
  ["PrepareLesson", PrepareLessonScreen, { headerShown: false }],
  ["LocalRisk", LocalRiskScreen, { title: "Local Risk" }],
  ["News", NewsScreen, { title: "Earthquake News" }],
  ["MyPlan", MyPlanScreen, { title: "My Plan" }],
  ["MedicalInfo", MedicalInfoScreen, { title: "Medical Information" }],
  ["ContactInfo", ContactInfoScreen, { title: "Emergency Contacts" }],
  ["ExportData", ExportDataScreen, { title: "Export Data" }],
  ["ImportantDocuments", ImportantDocumentsScreen, { title: "Important Documents" }],
];

export default function RootNavigator() {
  const { palette } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="BootGate"
      screenOptions={{
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
      }}
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
