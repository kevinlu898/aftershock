import { createNativeStackNavigator } from "@react-navigation/native-stack";
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

const Stack = createNativeStackNavigator();

const SCREENS = [
  ["Home", HomeScreen],
  ["Login", LoginScreen],
  ["AccountCreation", AccountCreationScreen],
  ["ChangeUsername", ChangeUsernameScreen],
  ["ChangePassword", ChangePasswordScreen],
  ["DeleteAccount", DeleteAccountScreen],
  ["TermsOfService", TermsOfServiceScreen],
  ["PrivacyPolicy", PrivacyPolicyScreen],
  ["ChangeDetails", ChangeDetailsScreen],
  ["MainApp", MainTabNavigator],
  ["prepareLessons", PrepareLessonScreen],
  ["LocalRisk", LocalRiskScreen],
  ["News", NewsScreen],
  ["myPlan", MyPlanScreen],
  ["medicalInfo", MedicalInfoScreen],
  ["contactInfo", ContactInfoScreen],
  ["ExportData", ExportDataScreen],
  ["importantDocuments", ImportantDocumentsScreen],
];

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      {SCREENS.map(([name, component]) => (
        <Stack.Screen key={name} name={name} component={component} />
      ))}
    </Stack.Navigator>
  );
}
