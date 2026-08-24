import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import {
  ClipboardList,
  Contact,
  ContactRound,
  Download,
  FileText,
  HeartPulse,
  KeyRound,
  LifeBuoy,
  ListChecks,
  LogOut,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  Trash2,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Platform, ScrollView, View } from "react-native";
import { Text } from "../../components/ui/text";
import {
  ListRow,
  PageHeader,
  Screen,
  SectionHeader,
} from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { auth } from "../../lib/firebaseConfig";
import {
  events as onboardingEvents,
  getPendingSteps,
  resetOnboarding,
} from "../../lib/onboardingState";
import { useTheme } from "../../lib/theme";
import { useToast } from "../../components/ui/toast";
import { cn } from "../../lib/utils";

function OptionRow({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  isDestructive = false,
}) {
  return (
    <ListRow
      icon={icon}
      title={title}
      subtitle={subtitle}
      onPress={onPress}
      destructive={isDestructive}
      trailing={!rightElement}
      className="border-b border-border last:border-b-0"
    >
      {rightElement}
    </ListRow>
  );
}

function PreferenceButton({ value, label }) {
  const { preference, setPreference } = useTheme();
  const selected = preference === value;
  return (
    <Button
      unstyled
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label} theme`}
      className={cn(
        "min-h-11 flex-1 items-center justify-center rounded-lg border px-2 py-2",
        selected
          ? "border-primary/30 bg-secondary"
          : "border-transparent bg-transparent active:bg-muted"
      )}
      onPress={() => setPreference(value)}
    >
      <Text
        className={cn(
          "text-footnote font-medium",
          selected ? "font-semibold text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </Text>
    </Button>
  );
}

export default function Profile() {
  const navigation = useNavigation();
  const toast = useToast();
  const [pendingSetup, setPendingSetup] = useState(0);

  const refreshSetup = useCallback(() => {
    getPendingSteps()
      .then((steps) => setPendingSetup(steps.length))
      .catch(() => setPendingSetup(0));
  }, []);

  useEffect(() => {
    refreshSetup();
    const off = onboardingEvents.on("changed", refreshSetup);
    const unsub = navigation.addListener?.("focus", refreshSetup);
    return () => {
      off?.();
      unsub?.();
    };
  }, [navigation, refreshSetup]);

  const redoSetup = async () => {
    await resetOnboarding();
    navigation.navigate("Onboarding");
  };

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
          } catch (error) {
            console.warn("Failed to log out", error);
            toast.error("Couldn’t log you out", {
              description: "Check your connection and try again.",
            });
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
      toast.error("No mail app available", {
        description: "Email us at aftershockapp@gmail.com.",
      })
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="grow gap-5 px-5 py-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Profile"
          description="Manage your account and preferences"
        />

        <Card className="overflow-hidden p-0">
          <View className="px-5 pt-5">
            <SectionHeader title="Emergency information"  />
          </View>
          <View className="px-2 pb-2">
            <OptionRow icon={ClipboardList} title="Manage My Plan" subtitle="Review and update your emergency plan" onPress={() => navigation.navigate("MyPlan")} />
            <OptionRow icon={ContactRound} title="Emergency Contacts" subtitle="Add or edit emergency contacts" onPress={() => navigation.navigate("ContactInfo")} />
            <OptionRow icon={HeartPulse} title="Medical Information" subtitle="Allergies, medications, health notes" onPress={() => navigation.navigate("MedicalInfo")} />
            <OptionRow icon={FileText} title="Important Documents" subtitle="Store copies of IDs and insurance policies" onPress={() => navigation.navigate("ImportantDocuments")} />
            {pendingSetup > 0 ? (
              <OptionRow icon={ListChecks} title="Finish setting up" subtitle={`${pendingSetup} step${pendingSetup === 1 ? "" : "s"} left`} onPress={() => navigation.navigate("Onboarding")} />
            ) : (
              <OptionRow icon={RotateCcw} title="Redo setup" subtitle="Walk through the setup steps again" onPress={redoSetup} />
            )}
          </View>
        </Card>

        <Card className="p-0">
          <View className="px-5 pt-5">
            <SectionHeader title="Appearance" description="Choose the theme used on this device." />
          </View>
          <View
            className="mx-4 mb-5 mt-1 flex-row rounded-xl bg-muted/60 p-1"
            accessibilityRole="radiogroup"
          >
            <PreferenceButton value="system" label="System" />
            <PreferenceButton value="light" label="Light" />
            <PreferenceButton value="dark" label="Dark" />
          </View>
        </Card>

        <Card className="overflow-hidden p-0">
          <View className="px-5 pt-5">
            <SectionHeader title="Account and support" />
          </View>
          <View className="px-2 pb-2">
            <OptionRow icon={KeyRound} title="Change Password" onPress={() => navigation.navigate("ChangePassword")} />
            <OptionRow icon={Contact} title="My Details" onPress={() => navigation.navigate("ChangeDetails")} />
            <OptionRow icon={Download} title="Export Data" onPress={() => navigation.navigate("ExportData")} />
            <Separator className="my-3" />
            <OptionRow icon={LifeBuoy} title="Help and Support" onPress={sendFeedback} />
            <OptionRow icon={ShieldCheck} title="Privacy Policy" onPress={() => navigation.navigate("PrivacyPolicy")} />
            <OptionRow icon={ScrollText} title="Terms of Service" onPress={() => navigation.navigate("TermsOfService")} />
            <Separator className="my-3" />
            <OptionRow icon={LogOut} title="Log Out" onPress={handleLogout} />
            <OptionRow icon={Trash2} title="Delete Account" onPress={() => navigation.navigate("DeleteAccount")} isDestructive />
          </View>
        </Card>

        <View className="items-center px-5 py-8">
          <Text className="text-sm font-semibold text-muted-foreground">Aftershock v1.0.0</Text>
          <Text className="mt-1 text-xs text-muted-foreground">Emergency Preparedness App</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
