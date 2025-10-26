import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../css";
import { auth } from "../../db/firebaseConfig";

// Option Row
const OptionRow = ({
  title,
  subtitle,
  onPress,
  rightElement,
  isDestructive = false,
}) => (
  <TouchableOpacity
    style={styles.optionRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.optionContent}>
      <Text
        style={[styles.optionTitle, isDestructive && styles.destructiveText]}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          style={[
            styles.optionSubtitle,
            isDestructive && styles.destructiveSubtitle,
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>

    {rightElement || <View style={styles.chevron} />}
  </TouchableOpacity>
);

// Switch Row
const SwitchRow = ({ title, subtitle, value, onValueChange }) => (
  <View style={styles.switchRow}>
    <View style={styles.switchContent}>
      <Text style={styles.switchTitle}>{title}</Text>

      {subtitle && <Text style={styles.switchSubtitle}>{subtitle}</Text>}
    </View>

    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.muted, true: colors.primary }}
      thumbColor={value ? "#fff" : "#f4f3f4"}
      ios_backgroundColor={colors.muted}
    />
  </View>
);

export default function Profile() {
  const navigation = useNavigation();

  // Preferences state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  // Clear async storage except important documents
  const clearAllExceptImportant = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      if (!allKeys || allKeys.length === 0) return;

      const keepPatterns = ["important_documents"];
      const keysToRemove = allKeys.filter((key) => {
        if (!key) return false;
        const lowerKey = key.toLowerCase();
        return !keepPatterns.some((pattern) =>
          lowerKey.includes(pattern.toLowerCase())
        );
      });

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.warn("Failed to clear storage", error);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (!confirmed) return;

      signOut(auth)
        .then(async () => {
          await clearAllExceptImportant();
          navigation.replace("Home");
        })
        .catch(() => {
          window.alert("Failed to log out.");
        });
    } else {
      Alert.alert(
        "Log Out",
        "Are you sure you want to log out?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Log Out",
            style: "destructive",
            onPress: async () => {
              try {
                await signOut(auth);
                await clearAllExceptImportant();
                navigation.replace("Login");
              } catch (error) {
                Alert.alert("Error", "Failed to log out.");
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  // Support functions

  const sendFeedback = () => {
    const email = "aftershockapp@gmail.com";
    const subject = "Aftershock Feedback/Support";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open mail client.")
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.heading}>Profile</Text>
          <Text style={styles.subtitle}>
            Manage your account and preferences
          </Text>
        </View>

        {/* Emergency Hub Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Hub</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Manage your emergency plan, contacts, medical info, and documents
          </Text>

          <View style={styles.sectionContent}>
            <OptionRow
              title="Manage My Plan"
              subtitle="Review and update your emergency plan"
              onPress={() => navigation.navigate("myPlan")}
            />

            <OptionRow
              title="Emergency Contacts"
              subtitle="Add or edit emergency contacts"
              onPress={() => navigation.navigate("contactInfo")}
            />

            <OptionRow
              title="Medical Information"
              subtitle="Allergies, medications, health notes"
              onPress={() => navigation.navigate("medicalInfo")}
            />

            <OptionRow
              title="Important Documents"
              subtitle="Store copies of IDs and insurance policies"
              onPress={() => navigation.navigate("importantDocuments")}
            />
          </View>
        </View>

        {/* Preferences Section */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Customize your app experience and notifications
          </Text>

          <View style={styles.sectionContent}>
            <SwitchRow
              title="Push Notifications"
              subtitle="Receive alerts and emergency updates"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />

            <SwitchRow
              title="Location Services"
              subtitle="Enable for local emergency guidance"
              value={locationEnabled}
              onValueChange={setLocationEnabled}
            />
          </View>
        </View> */}

        {/* Account & Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account & Support</Text>
          </View>

          <View style={styles.sectionContent}>
            <OptionRow
              title="Change Username"
              onPress={() => navigation.navigate("ChangeUsername")}
            />

            <OptionRow
              title="Change Password"
              onPress={() => navigation.navigate("ChangePassword")}
            />

            <OptionRow
              title="My Details"
              subtitle="View and update name, zip code, phone, and email"
              onPress={() => navigation.navigate("ChangeDetails")}
            />

            <OptionRow
              title="Export Data"
              subtitle="Download your emergency plan and records (all non-sensitive data)"
              onPress={() => navigation.navigate("ExportData")}
            />

            <View style={styles.divider} />

            <OptionRow title="Help and Support" onPress={sendFeedback} />

            <OptionRow
              title="Privacy Policy"
              onPress={() => navigation.navigate("PrivacyPolicy")}
            />

            <OptionRow
              title="Terms of Service"
              onPress={() => navigation.navigate("TermsOfService")}
            />

            <View style={styles.divider} />

            <OptionRow title="Log Out" onPress={handleLogout} />

            <OptionRow
              title="Delete Account"
              subtitle="Permanently remove your account and data"
              onPress={() => navigation.navigate("DeleteAccount")}
              isDestructive={true}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Aftershock v1.0.0</Text>
          <Text style={styles.footerSubtext}>Emergency Preparedness App</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout containers
  safeArea: {
    flex: 1,
    backgroundColor: colors.light,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Header styles
  header: {
    marginBottom: 10,
    paddingVertical: 16,
    alignItems: "center",
  },

  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },

  // Section styles
  section: {
    marginBottom: 24,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    overflow: "hidden",
  },

  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.dark,
  },

  sectionDescription: {
    fontSize: 14,
    color: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    lineHeight: 18,
  },

  sectionContent: {
    paddingHorizontal: 12,
  },

  // Option row styles
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  optionContent: {
    flex: 1,
    marginRight: 16,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 4,
  },

  optionSubtitle: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 18,
  },

  // Switch row styles
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  switchContent: {
    flex: 1,
    marginRight: 16,
  },

  switchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 4,
  },

  switchSubtitle: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 18,
  },

  // Visual elements
  chevron: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.muted,
    transform: [{ rotate: "45deg" }],
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
    marginHorizontal: 12,
  },

  // Destructive actions
  destructiveText: {
    color: "#dc2626",
  },

  destructiveSubtitle: {
    color: "#dc2626",
    opacity: 0.8,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },

  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 6,
  },

  footerSubtext: {
    fontSize: 12,
    color: colors.muted,
    opacity: 0.7,
  },
});
