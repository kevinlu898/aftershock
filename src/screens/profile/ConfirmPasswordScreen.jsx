import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FormField } from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { backendHash } from "../../lib/api";
import { db } from "../../lib/firebaseConfig";
import { clearData, getData, storeData } from "../../lib/storage/storageUtils";

export default function ConfirmPasswordScreen() {
  const navigation = useNavigation();
  const { changeType, changes } = useRoute().params ?? {};
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isDetailsChange = changeType === "details";

  const handleConfirm = async () => {
    if (!currentPassword) {
      Alert.alert("Error", "Enter your current password to confirm.");
      return;
    }
    if (!changes || (!isDetailsChange && changeType !== "username")) {
      Alert.alert("Error", "The requested account change is unavailable.");
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const username = await getData("username");
      if (!username) throw new Error("No username found.");

      const userQuery = query(collection(db, "user"), where("username", "==", username));
      const userResult = await getDocs(userQuery);
      if (userResult.empty) throw new Error("User record not found.");

      const userDoc = userResult.docs[0];
      const currentHash = await backendHash(currentPassword);
      if (!currentHash || userDoc.data().password_hash !== currentHash) {
        Alert.alert("Error", "Current password is incorrect.");
        return;
      }

      if (isDetailsChange) {
        await updateDoc(userDoc.ref, {
          first_name: changes.firstName,
          last_name: changes.lastName,
          zip_code: changes.zipcode,
          phone_number: changes.phone,
          email: changes.email,
        });
        await storeData("firstname", changes.firstName);
        await storeData("postalcode", changes.zipcode);
        await storeData("email", changes.email);
        await clearData("riskdata");
      } else {
        const usernameQuery = query(collection(db, "user"), where("username", "==", changes.newUsername));
        const usernameResult = await getDocs(usernameQuery);
        if (!usernameResult.empty) {
          Alert.alert("Error", "Username already taken. Choose another.");
          return;
        }
        await updateDoc(userDoc.ref, { username: changes.newUsername });
        await storeData("username", changes.newUsername);
      }

      Alert.alert("Success", isDetailsChange ? "Details updated." : "Username updated.", [
        { text: "OK", onPress: () => navigation.pop(2) },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to save account changes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView className="flex-1" contentContainerClassName="grow pb-[60px]" keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-background p-[20px]">
          <Card className="gap-5">
            <Text className="text-sm leading-5 text-muted-foreground">
              Enter your current password to {isDetailsChange ? "save these details" : "change your username"}.
            </Text>
            <FormField label="Confirm password">
              <Input
                placeholder="Current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                accessibilityLabel="Confirm current password"
              />
            </FormField>
            <Button onPress={handleConfirm} loading={loading}>Confirm and Save</Button>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
