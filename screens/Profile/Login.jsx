import { useNavigation } from "@react-navigation/native";
import { and, collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, } from "react-native";
import { colors, fontSizes } from "../../css";
import { db } from "../../db/firebaseConfig";
import { backendHash } from "../../requests";
import { fillData, storeData } from "../../storage/storageUtils";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleVerify = async () => {
    const userTable = collection(db, "user");
    const thehash = await backendHash(password);
    const queryToCheck = query(
      userTable,
      and(where("username", "==", username), where("password_hash", "==", thehash))
    );
    const results = await getDocs(queryToCheck);
    if (!results.empty) {
      Alert.alert("Success", "You are logged in!");
      await storeData("isLoggedIn", "yes");
      await storeData("username", username);
      await fillData(username);
      navigation.replace("MainApp");
    } else {
      Alert.alert(
        "Error",
        "Either your username or password is wrong. Try creating a new account..."
      );
    }
  };

  const statusBarHeight =
    Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24;

  return (
    <View style={{ flex: 1, backgroundColor: colors.light }}>
      <View style={[styles.statusBarBackground, { height: statusBarHeight }]} />

      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent={Platform.OS === "android"}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingTop: statusBarHeight + 18 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.heading}>Welcome back to Aftershock!</Text>
              <Image
                source={require("../../assets/images/favicon.png")}
                style={styles.logo}
              />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Username:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                returnKeyType="next"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.inputLabel}>Password:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleVerify}
                placeholderTextColor={colors.muted}
              />

              <TouchableOpacity style={styles.button} onPress={handleVerify}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.replace("AccountCreation")}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>I don't have an account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: "center",
    paddingBottom: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  heading: {
    fontSize: fontSizes.xlarge,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputLabel: {
    fontSize: fontSizes.medium,
    color: colors.accent,
    textAlign: "left",
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderColor: colors.secondary + "80",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: fontSizes.medium,
    backgroundColor: "#fff",
    color: colors.dark,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: fontSizes.large,
    textAlign: "center",
    fontWeight: "bold",
  },
  linkContainer: {
    marginTop: 20,
    padding: 8,
  },
  linkText: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "500",
    fontSize: fontSizes.medium,
  },
});
