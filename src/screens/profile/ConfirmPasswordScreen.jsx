import { Button } from "../../components/ui/button";
import { PasswordInput } from "../../components/ui/password-input";
import { useToast } from "../../components/ui/toast";
import haptics from "../../lib/haptics";
import { FormField } from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Text } from "../../components/ui/text";
import { backendHash } from "../../lib/api";
import { db } from "../../lib/firebaseConfig";
import { clearData, getData, storeData } from "../../lib/storage/storageUtils";

export default function ConfirmPasswordScreen() {
  const navigation = useNavigation();
  const { changeType, changes } = useRoute().params ?? {};
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const isDetailsChange = changeType === "details";
  const toast = useToast();
  const passwordRef = useRef(null);

  const handleConfirm = async () => {
    if (!currentPassword) {
      setError("Enter your current password to confirm.");
      haptics.warning();
      passwordRef.current?.focus?.();
      return;
    }
    if (!changes || (!isDetailsChange && changeType !== "username")) {
      toast.error("That account change is unavailable");
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
        setError("That isn’t your current password.");
        haptics.error();
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
          setError("That username is already taken. Choose another.");
          haptics.error();
          return;
        }
        await updateDoc(userDoc.ref, { username: changes.newUsername });
        await storeData("username", changes.newUsername);
      }

      haptics.success();
      toast.success(isDetailsChange ? "Details updated" : "Username updated");
      navigation.pop(2);
    } catch (saveError) {
      console.warn("Failed to save account changes", saveError);
      toast.error("Couldn’t save your changes", {
        description: saveError.message || "Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView className="flex-1" contentContainerClassName="grow pb-[60px]" keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-background p-[20px]">
          <Card className="gap-5">
            <Text className="text-body-sm text-muted-foreground">
              Enter your current password to {isDetailsChange ? "save these details" : "change your username"}.
            </Text>
            <FormField label="Confirm password" error={error}>
              <PasswordInput
                ref={passwordRef}
                placeholder="Current password"
                value={currentPassword}
                onChangeText={(value) => {
                  setCurrentPassword(value);
                  if (error) setError(null);
                }}
                autoComplete="current-password"
                textContentType="password"
                accessibilityLabel="Confirm current password"
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
              />
            </FormField>
            <Button onPress={handleConfirm} loading={loading}>Confirm and Save</Button>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
