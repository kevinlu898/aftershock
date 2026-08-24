import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { FormField } from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { PasswordInput } from "../../components/ui/password-input";
import { Text } from "../../components/ui/text";
import { useToast } from "../../components/ui/toast";
import { backendHash } from "../../lib/api";
import { db } from "../../lib/firebaseConfig";
import haptics from "../../lib/haptics";
import { getData } from "../../lib/storage/storageUtils";
import { compactErrors, validatePassword } from "../../lib/validation";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();
  const currentRef = useRef(null);
  const newRef = useRef(null);

  const handleSave = async () => {
    const nextErrors = compactErrors({
      currentPassword: currentPassword
        ? null
        : "Enter your current password to confirm.",
      newPassword: validatePassword(newPassword),
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      haptics.warning();
      (nextErrors.currentPassword ? currentRef : newRef).current?.focus?.();
      return;
    }

    setSubmitting(true);
    try {
      const username = await getData("username");
      if (!username) {
        toast.error("No account found on this device");
        return;
      }

      const results = await getDocs(
        query(collection(db, "user"), where("username", "==", username))
      );
      if (results.empty) {
        toast.error("We couldn’t find your account record");
        return;
      }

      const userData = results.docs[0].data();
      const currentHash = await backendHash(currentPassword);
      if (!currentHash || userData.password_hash !== currentHash) {
        setErrors({ currentPassword: "That isn’t your current password." });
        haptics.error();
        return;
      }

      await updateDoc(results.docs[0].ref, {
        password_hash: await backendHash(newPassword),
      });
      haptics.success();
      toast.success("Password updated");
      navigation.goBack();
    } catch (error) {
      console.warn("Failed to update password", error);
      toast.error("Couldn’t update your password", {
        description: "Check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const update = (setter, key) => (value) => {
    setter(value);
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="grow p-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Text className="mb-3 text-secondary-foreground">
            Update your account password. Make sure it is at least 8 characters
            long.
          </Text>

          <FormField label="Current password" error={errors.currentPassword}>
            <PasswordInput
              ref={currentRef}
              placeholder="Current password"
              value={currentPassword}
              onChangeText={update(setCurrentPassword, "currentPassword")}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="next"
              onSubmitEditing={() => newRef.current?.focus?.()}
            />
          </FormField>

          <FormField
            label="New password"
            error={errors.newPassword}
            description="Use at least 8 characters with uppercase and lowercase letters."
          >
            <PasswordInput
              ref={newRef}
              placeholder="New password"
              value={newPassword}
              onChangeText={update(setNewPassword, "newPassword")}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </FormField>

          <Button onPress={handleSave} loading={submitting}>
            Save Password
          </Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
