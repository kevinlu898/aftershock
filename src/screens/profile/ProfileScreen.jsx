import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { PageHeader } from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { auth } from "../../lib/firebaseConfig";
import { useTheme } from "../../lib/theme";
import { cn } from "../../lib/utils";

function OptionRow({
  title,
  subtitle,
  onPress,
  rightElement,
  isDestructive = false,
}) {
  return (
    <Button
      variant="ghost"
      accessibilityRole="button"
      accessibilityLabel={title}
      className="h-auto min-h-14 w-full justify-between rounded-none border-b border-border px-3 py-4 active:bg-secondary"
      onPress={onPress}
    >
      <View className="mr-4 flex-1">
        <Text
          className={cn(
            "text-base font-semibold text-foreground",
            isDestructive && "text-destructive"
          )}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className={cn(
              "mt-1 text-sm leading-5 text-muted-foreground",
              isDestructive && "text-destructive"
            )}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightElement || (
        <Text className="text-2xl font-light text-muted-foreground">›</Text>
      )}
    </Button>
  );
}

function PreferenceButton({ value, label }) {
  const { preference, setPreference } = useTheme();
  const selected = preference === value;
  return (
    <Button
      variant={selected ? "default" : "outline"}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={cn(
        "h-auto min-h-11 flex-1 items-center justify-center rounded-xl border px-2",
        selected
          ? "border-primary"
          : "border-border active:bg-secondary"
      )}
      onPress={() => setPreference(value)}
    >
      <Text
        className={cn(
          "text-sm font-bold",
          selected ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {label}
      </Text>
    </Button>
  );
}

export default function Profile() {
  const navigation = useNavigation();

  const clearAllExceptImportant = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      if (!allKeys?.length) return;
      const keepPatterns = ["important_documents", "appearancePreference"];
      const keysToRemove = allKeys.filter((key) => {
        const lowerKey = key?.toLowerCase();
        return (
          lowerKey &&
          !keepPatterns.some((pattern) =>
            lowerKey.includes(pattern.toLowerCase())
          )
        );
      });
      if (keysToRemove.length) await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.warn("Failed to clear storage", error);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (!window.confirm("Are you sure you want to log out?")) return;
      signOut(auth)
        .then(async () => {
          await clearAllExceptImportant();
          navigation.replace("Home");
        })
        .catch(() => window.alert("Failed to log out."));
      return;
    }
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            await clearAllExceptImportant();
            navigation.replace("Login");
          } catch (_error) {
            Alert.alert("Error", "Failed to log out.");
          }
        },
      },
    ]);
  };

  const sendFeedback = () => {
    const url = `mailto:aftershockapp@gmail.com?subject=${encodeURIComponent(
      "Aftershock Feedback/Support"
    )}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open mail client.")
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="grow px-5 py-6"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Profile"
          description="Manage your account and preferences"
        />

        <Card className="mb-5 p-0">
          <View className="px-5 pb-3 pt-5">
            <Text className="text-xl font-bold text-foreground">Appearance</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Choose how Aftershock looks on this device.
            </Text>
          </View>
          <View className="flex-row gap-2 px-4 pb-5">
            <PreferenceButton value="system" label="System" />
            <PreferenceButton value="light" label="Light" />
            <PreferenceButton value="dark" label="Dark" />
          </View>
        </Card>

        <Card className="mb-5 overflow-hidden p-0">
          <View className="px-5 pb-3 pt-5">
            <Text className="text-xl font-bold text-foreground">Emergency Hub</Text>
            <Text className="mt-1 text-sm leading-5 text-muted-foreground">
              Manage your emergency plan, contacts, medical info, and documents
            </Text>
          </View>
          <View className="px-2 pb-2">
            <OptionRow title="Manage My Plan" subtitle="Review and update your emergency plan" onPress={() => navigation.navigate("myPlan")} />
            <OptionRow title="Emergency Contacts" subtitle="Add or edit emergency contacts" onPress={() => navigation.navigate("contactInfo")} />
            <OptionRow title="Medical Information" subtitle="Allergies, medications, health notes" onPress={() => navigation.navigate("medicalInfo")} />
            <OptionRow title="Important Documents" subtitle="Store copies of IDs and insurance policies" onPress={() => navigation.navigate("importantDocuments")} />
          </View>
        </Card>

        <Card className="overflow-hidden p-0">
          <View className="px-5 pb-3 pt-5">
            <Text className="text-xl font-bold text-foreground">Account & Support</Text>
          </View>
          <View className="px-2 pb-2">
            <OptionRow title="Change Username" onPress={() => navigation.navigate("ChangeUsername")} />
            <OptionRow title="Change Password" onPress={() => navigation.navigate("ChangePassword")} />
            <OptionRow title="My Details" subtitle="View and update name, zip code, phone, and email" onPress={() => navigation.navigate("ChangeDetails")} />
            <OptionRow title="Export Data" subtitle="Download your emergency plan and records (all non-sensitive data)" onPress={() => navigation.navigate("ExportData")} />
            <Separator className="my-3" />
            <OptionRow title="Help and Support" onPress={sendFeedback} />
            <OptionRow title="Privacy Policy" onPress={() => navigation.navigate("PrivacyPolicy")} />
            <OptionRow title="Terms of Service" onPress={() => navigation.navigate("TermsOfService")} />
            <Separator className="my-3" />
            <OptionRow title="Log Out" onPress={handleLogout} />
            <OptionRow title="Delete Account" subtitle="Permanently remove your account and data" onPress={() => navigation.navigate("DeleteAccount")} isDestructive />
          </View>
        </Card>

        <View className="items-center px-5 py-8">
          <Text className="text-sm font-semibold text-muted-foreground">Aftershock v1.0.0</Text>
          <Text className="mt-1 text-xs text-muted-foreground">Emergency Preparedness App</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
