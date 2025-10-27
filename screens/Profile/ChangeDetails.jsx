import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, updateDoc, where, } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { colors, globalStyles } from "../../css";
import { db } from "../../db/firebaseConfig";
import { backendHash } from "../../requests";
import { clearData, getData, storeData } from "../../storage/storageUtils";

export default function ChangeDetails() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const username = await getData("username");
      if (!username) return;
      const q = query(
        collection(db, "user"),
        where("username", "==", username)
      );
      const res = await getDocs(q);
      if (res.empty) return;
      const data = res.docs[0].data();
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setZipcode(data.zip_code || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
    })();
  }, []);

  const handleSave = async () => {
    if (!currentPassword || currentPassword.length === 0) {
      Alert.alert("Error", "Enter your current password to confirm.");
      return;
    }

    setLoading(true);
    try {
      const username = await getData("username");
      if (!username) {
        Alert.alert("Error", "No username found.");
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "user"),
        where("username", "==", username)
      );
      const res = await getDocs(q);
      if (res.empty) {
        Alert.alert("Error", "User not found.");
        setLoading(false);
        return;
      }

      const docRef = res.docs[0].ref;
      const userData = res.docs[0].data();

      const ch = await backendHash(currentPassword);
      if (!ch || userData.password_hash !== ch) {
        Alert.alert("Error", "Current password is incorrect.");
        setLoading(false);
        return;
      }

      await updateDoc(docRef, {
        first_name: firstName,
        last_name: lastName,
        zip_code: zipcode,
        phone_number: phone,
        email: email,
      });
      await storeData("firstname", firstName);
      await storeData("postalcode", zipcode);
      await storeData("email", email);
      await clearData("riskdata");

      Alert.alert("Success", "Details updated.");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={globalStyles.container}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={globalStyles.backButton}
          >
            <Text style={globalStyles.backButtonText}>{"← Back"}</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={globalStyles.heading}>Change Details</Text>
            <Text style={globalStyles.inputLabel}>First Name</Text>
            <TextInput
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
              style={globalStyles.input}
            />
            <Text style={globalStyles.inputLabel}>Last Name</Text>
            <TextInput
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
              style={globalStyles.input}
            />
            <Text style={globalStyles.inputLabel}>Zip Code</Text>
            <TextInput
              placeholder="Zip code"
              value={zipcode}
              onChangeText={setZipcode}
              style={globalStyles.input}
              keyboardType="number-pad"
            />
            <Text style={globalStyles.inputLabel}>Phone</Text>
            <TextInput
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              style={globalStyles.input}
              keyboardType="phone-pad"
            />
            <Text style={globalStyles.inputLabel}>Email</Text>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={globalStyles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.confirmBox}>
              <Text style={styles.confirmHeading}>Enter password</Text>
              <Text style={globalStyles.inputLabel}>
                Enter your password to confirm your changes
              </Text>
              <TextInput
                placeholder="Current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={styles.confirmInput}
                accessibilityLabel="Confirm current password"
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              style={{
                backgroundColor: "#519872",
                borderRadius: 8,
                padding: 12,
              }}
              disabled={loading}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 18,
    paddingTop: 24,
    justifyContent: "flex-start",
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },

  confirmBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FBFCFD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  confirmHeading: {
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 6,
  },
  confirmInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    backgroundColor: "#fff",
    marginTop: 6,
  },
});
