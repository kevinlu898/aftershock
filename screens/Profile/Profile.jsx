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
import { storeData } from "../../storage/storageUtils";

// Enhanced OptionRow with better styling and icons
const OptionRow = ({ title, subtitle, onPress, rightElement, isDestructive = false }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.rowContent}>
      <Text style={[
        styles.rowTitle,
        isDestructive && styles.destructiveText
      ]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[
          styles.rowSubtitle,
          isDestructive && styles.destructiveSubtitle
        ]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    {rightElement || <View style={styles.chevron} />}
  </TouchableOpacity>
);

// Switch Row component for consistent toggle styling
const SwitchRow = ({ title, subtitle, value, onValueChange }) => (
  <View style={styles.row}>
    <View style={styles.rowContent}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? (
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      ) : null}
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

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (!confirmed) return;
      signOut(auth)
        .then(async () => {
          await storeData("isLoggedIn", "no");
          await storeData("username", "");
          navigation.replace("Login");
        })
        .catch(() => {
          window.alert("Failed to log out.");
        });
    } else {
      Alert.alert(
        "Log Out",
        "Are you sure you want to log out?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            onPress: async () => {
              try {
                await signOut(auth);
                await storeData("isLoggedIn", "no");
                await storeData("username", "");
                navigation.replace("Login");
              } catch (e) {
                Alert.alert("Error", "Failed to log out.");
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  // Emergency hub actions (placeholders)
  const openManagePlan = () => navigation.navigate("Prepare");
  const openContacts = () => navigation.navigate("Contacts");
  const openMedicalInfo = () => navigation.navigate("Medical");
  const openDocuments = () => navigation.navigate("Documents");

  // Account actions
  const changeUsername = () => navigation.navigate('ChangeUsername');
  const changePassword = () => navigation.navigate('ChangePassword');
  const exportData = () => Alert.alert("Export Data", "Preparing export...");
  const deleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            Alert.alert("Deleted", "Account deleted (placeholder)."),
        },
      ],
      { cancelable: true }
    );
  };

  // Support
  const openHelp = () => navigation.navigate("Help");
  const openFAQ = () => navigation.navigate("FAQ");
  const sendFeedback = () => {
    const email = "support@aftershock.app";
    const subject = "Aftershock Feedback";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open mail client.")
    );
  };
  const openPrivacy = () =>
    Linking.openURL("https://example.com/privacy").catch(() => {});
  const openTerms = () =>
    Linking.openURL("https://example.com/terms").catch(() => {});

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.light }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* Emergency Hub */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Hub</Text>
          </View>
          <Text style={styles.sectionNote}>
            Manage your emergency plan, contacts, medical info, and documents
          </Text>
          
          <View style={styles.sectionContent}>
            <OptionRow
              title="Manage My Plan"
              subtitle="Review and update your emergency plan"
              onPress={openManagePlan}
            />
            <OptionRow
              title="Emergency Contacts"
              subtitle="Add or edit emergency contacts"
              onPress={openContacts}
            />
            <OptionRow
              title="Medical Information"
              subtitle="Allergies, medications, health notes"
              onPress={openMedicalInfo}
            />
            <OptionRow
              title="Important Documents"
              subtitle="Store copies of IDs and insurance policies"
              onPress={openDocuments}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <Text style={styles.sectionNote}>
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
        </View>

        {/* Account & Support */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account & Support</Text>
          </View>

          <View style={styles.sectionContent}>
            <OptionRow 
              title="Change Username" 
              onPress={changeUsername} 
            />
            <OptionRow 
              title="Change Password" 
              onPress={changePassword} 
            />
            <OptionRow
              title="Export Data"
              subtitle="Download your emergency plan and records"
              onPress={exportData}
            />
            
            <View style={styles.divider} />
            
            <OptionRow
              title="Help & Support"
              onPress={openHelp}
            />
            <OptionRow 
              title="Frequently Asked Questions" 
              onPress={openFAQ} 
            />
            <OptionRow 
              title="Send Feedback" 
              onPress={sendFeedback} 
            />
            <OptionRow 
              title="Privacy Policy" 
              onPress={openPrivacy} 
            />
            <OptionRow 
              title="Terms of Service" 
              onPress={openTerms} 
            />
            
            <View style={styles.divider} />
            
            <OptionRow 
              title="Log Out" 
              onPress={handleLogout}
              isDestructive={false}
            />
            <OptionRow
              title="Delete Account"
              subtitle="Permanently remove your account and data"
              onPress={deleteAccount}
              isDestructive={true}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Aftershock v1.0.0</Text>
          <Text style={styles.footerSubtext}>Emergency Preparedness App</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.light,
  },
  header: {
    marginBottom: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: "500",
    textAlign: 'center',
  },
  section: {
    marginTop: 4,
    marginBottom: 8,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.dark,
  },
  sectionNote: {
    fontSize: 14,
    color: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    lineHeight: 16,
  },
  sectionContent: {
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowContent: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 18,
  },
  destructiveText: {
    color: "#dc2626",
  },
  destructiveSubtitle: {
    color: "#dc2626" + "cc",
  },
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
    marginVertical: 8,
    marginHorizontal: 12,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.muted + "aa",
  },
});