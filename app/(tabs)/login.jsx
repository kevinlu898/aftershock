import { and, collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../db/firebaseConfig";
import { colors, fontSizes, globalStyles } from "../css";

const styles = {
  input: {
    height: 50,
    borderColor: colors.secondary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: fontSizes.medium,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: fontSizes.medium,
    color: colors.accent,
    textAlign: "left",
    marginBottom: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: fontSizes.large,
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleVerify = async () => {
    const userTable = collection(db, "user");

    const queryToCheck = query(
      userTable,
      and(where("username", "==", username), where("password", "==", password))
    );

    const results = await getDocs(queryToCheck);
    if (!results.empty) {
      console.log("exists!");
      Alert.alert("Success", "You are logged in!");
    } else {
      console.log("acc doesn't");
      Alert.alert(
        "Error",
        "Either your username or password is wrong. Try creating a new account..."
      );
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          source={require("../../assets/images/favicon.png")}
          style={{ width: 250, height: 250, borderRadius: 30 }}
        />
        <Text style={globalStyles.subheading}>
          {"\n"}Welcome back to Aftershock!{"\n"}{" "}
        </Text>
      </View>

      <Text style={[globalStyles.text, styles.inputLabel]}>Username:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Username"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={[globalStyles.text, styles.inputLabel]}>Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
