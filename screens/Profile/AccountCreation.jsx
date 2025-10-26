import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox";
import {
  addDoc,
  collection,
  getDocs,
  or,
  query,
  where,
} from "firebase/firestore";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, fontSizes, globalStyles } from "../../css";
import { db } from "../../db/firebaseConfig";
import { backendHash } from "../../requests";
import { storeData } from "../../storage/storageUtils";

export default function AccountFlow() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [termsAgree, setTermsAgree] = useState(false);

  // Refs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const lastNameRef = useRef(null);
  const zipRef = useRef(null);
  const phoneRef = useRef(null);

  const statusBarHeight =
    Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24;

  const addUser = async () => {
    try {
      const thehash = await backendHash(password);
      const docRef = await addDoc(collection(db, "user"), {
        username,
        email,
        password_hash: thehash,
        first_name: firstName,
        last_name: lastName,
        zip_code: zipCode,
        phone_number: phoneNumber,
      });
      storeData("isLoggedIn", "yes");
      storeData("username", username);
      storeData("email", email);
      storeData("firstname", firstName);
      storeData("postalcode", zipCode);
      console.log("Document written with ID:", docRef.id);
    } catch (e) {
      console.error("Error adding document:", e);
    }
  };

  const handleNext = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (username.length < 3 || username.length > 20) {
      Alert.alert("Error", "Username must be 3-20 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      Alert.alert(
        "Error",
        "Username must only contain letters, numbers, or underscores."
      );
      return;
    }

    if (!email.includes("@") || !email.includes(".") || email.length < 5) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    const queryToCheck = query(
      collection(db, "user"),
      or(where("username", "==", username), where("email", "==", email))
    );
    const results = await getDocs(queryToCheck);
    if (!results.empty) {
      Alert.alert("Error", "Username or email already used. Try again.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      Alert.alert(
        "Error",
        "Password must contain a mix of uppercase and lowercase letters"
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setStep(2);
  };

  const handleCreateAccount = async () => {
    if (!firstName || !lastName || !zipCode || !phoneNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!/^\d{5}$/.test(zipCode)) {
      Alert.alert("Error", "Please enter a valid 5-digit zip code");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    const queryToCheck = query(
      collection(db, "user"),
      where("phone_number", "==", phoneNumber)
    );
    const results = await getDocs(queryToCheck);
    if (!results.empty) {
      Alert.alert("Error", "Phone number already used.");
      return;
    }

    if (!termsAgree) {
      Alert.alert("Error", "You must agree to the Terms & Privacy Policy");
      return;
    }

    await addUser();

    Alert.alert("Success", `Welcome ${username}! Account created.`);
    navigation.navigate("MainApp");
  };

  const handleNavigateToLogin = () => {
    navigation.replace("Login");
  };

  const openPrivacy = () => navigation.navigate("PrivacyPolicy");
  const openTos = () => navigation.navigate("TermsOfService");

  return (
    <View style={{ flex: 1, backgroundColor: colors.light }}>
      {/* Status Bar Background */}
      <View style={[styles.statusBarBackground, { height: statusBarHeight }]} />

      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent={Platform.OS === "android"}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : statusBarHeight}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingTop: statusBarHeight + 18, paddingBottom: 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? (
            <>
              <Text style={[globalStyles.heading, styles.heading]}>
                Create New Account
              </Text>

              <Text style={styles.inputLabel}>Username:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Username"
                value={username}
                onChangeText={setUsername}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => emailRef.current?.focus()}
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Enter Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.inputLabel}>Password:</Text>
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.inputLabel}>Confirm Password:</Text>
              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleNext}
                placeholderTextColor={colors.muted}
              />

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNavigateToLogin}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>I already have an account</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View>
              <Text style={[globalStyles.heading, styles.heading]}>
                Enter Your Details
              </Text>

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>{"← Back"}</Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <View style={styles.nameContainer}>
                  <Text style={styles.inputLabel}>First Name:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    placeholderTextColor={colors.muted}
                  />
                </View>

                <View style={styles.nameContainer}>
                  <Text style={styles.inputLabel}>Last Name:</Text>
                  <TextInput
                    ref={lastNameRef}
                    style={styles.input}
                    placeholder="Enter Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => zipRef.current?.focus()}
                    placeholderTextColor={colors.muted}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Zip Code:</Text>
              <TextInput
                ref={zipRef}
                style={styles.input}
                placeholder="Enter Zip Code"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => phoneRef.current?.focus()}
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.inputLabel}>Phone Number:</Text>
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="Enter Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleCreateAccount}
                placeholderTextColor={colors.muted}
              />

              <View style={styles.checkboxContainer}>
                <Checkbox
                  value={termsAgree}
                  onValueChange={setTermsAgree}
                  color={termsAgree ? colors.primary : undefined}
                />
                <Text style={styles.checkboxLabel}>
                  I agree to the{" "}
                  <Text style={styles.link} onPress={openTos}>
                    Terms of Service
                  </Text>{" "}
                  &amp;{" "}
                  <Text style={styles.link} onPress={openPrivacy}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleCreateAccount}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = {
  statusBarBackground: {
    backgroundColor: colors.light,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  scrollContainer: {
    padding: 18,
    flexGrow: 1,
  },
  heading: {
    marginTop: 10,
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: colors.secondary + "80",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: fontSizes.medium,
    backgroundColor: "#fff",
    color: colors.dark,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: fontSizes.medium,
    color: colors.accent,
    marginBottom: 4,
    fontWeight: "600",
  },
  buttonText: {
    color: "#fff",
    fontSize: fontSizes.large,
    textAlign: "center",
    fontWeight: "bold",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: fontSizes.medium,
    color: colors.accent,
    flex: 1,
    lineHeight: 20,
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  nameContainer: {
    flex: 1,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  backButtonText: {
    color: colors.primary,
    fontSize: fontSizes.medium,
    fontWeight: "700",
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "500",
  },
};
