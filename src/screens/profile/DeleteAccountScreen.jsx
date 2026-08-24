import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormField } from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { PasswordInput } from "../../components/ui/password-input";
import { Text } from "../../components/ui/text";
import { useToast } from "../../components/ui/toast";
import { backendHash } from "../../lib/api";
import { auth, db } from "../../lib/firebaseConfig";
import haptics from "../../lib/haptics";
import { getData } from "../../lib/storage/storageUtils";

export default function DeleteAccount() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

  useEffect(() => {
    getData("email")
      .then((current) => {
        if (current) setEmailInput(current);
      })
      .catch((e) => console.warn("Error loading email for deletion", e));
  }, []);

  const clearAll = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn("Failed to clear storage", e);
    }
  };

  const performDelete = async (userDoc) => {
    try {
      await deleteDoc(userDoc.ref);
      await clearAll();
      try {
        await signOut(auth);
      } catch {
      }
      toast.success("Your account has been deleted");
      navigation.replace("Login");
    } catch (err) {
      console.warn("Failed to delete account", err);
      toast.error("Couldn’t delete your account", {
        description: "Check your connection and try again.",
      });
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!passwordInput) {
      setError("Enter your password to confirm.");
      haptics.warning();
      passwordRef.current?.focus?.();
      return;
    }

    setLoading(true);
    try {
      const results = await getDocs(
        query(
          collection(db, "user"),
          where("email", "==", emailInput.trim().toLowerCase())
        )
      );
      if (results.empty) {
        setError("No account found with that email.");
        haptics.error();
        setLoading(false);
        return;
      }

      const userDoc = results.docs[0];
      const data = userDoc.data();
      const hashed = await backendHash(passwordInput);
      if (!hashed || data.password_hash !== hashed) {
        setError("That password is incorrect.");
        haptics.error();
        setLoading(false);
        return;
      }

      const logged = await getData("username");
      if (!logged || logged !== (data.username || data.email)) {
        toast.error("Wrong account", {
          description:
            "You can only delete the account you are currently signed in with.",
        });
        setLoading(false);
        return;
      }

      Alert.alert(
        "Delete your account?",
        "This permanently deletes your account and all associated data. This cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setLoading(false),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => performDelete(userDoc),
          },
        ],
        { cancelable: true, onDismiss: () => setLoading(false) }
      );
    } catch (err) {
      console.warn("Unexpected error deleting account", err);
      toast.error("Something went wrong", {
        description: "Check your connection and try again.",
      });
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 18,
          paddingBottom: (insets?.bottom || 16) + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card className="gap-4">
          <Text className="text-secondary-foreground">
            To permanently delete your account, please verify your password.
          </Text>

          <FormField label="Email">
            <Input
              placeholder="Email"
              value={emailInput}
              onChangeText={setEmailInput}
              className="bg-muted text-muted-foreground"
              autoCapitalize="none"
              editable={false}
              selectTextOnFocus={false}
            />
          </FormField>

          <FormField label="Confirm password" error={error}>
            <PasswordInput
              ref={passwordRef}
              placeholder="Password"
              value={passwordInput}
              onChangeText={(value) => {
                setPasswordInput(value);
                if (error) setError(null);
              }}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleDelete}
            />
          </FormField>

          <View className="rounded-lg border-l-4 border-warning bg-warning/10 px-3 py-2.5">
            <Text className="mb-1 font-bold text-warning">Important</Text>
            <Text className="text-footnote text-warning">
              Deleting your account will permanently remove all of your data,
              including emergency contacts, plans, documents, and preferences.
              This action cannot be undone.
            </Text>
          </View>

          <Button variant="destructive" onPress={handleDelete} loading={loading}>
            Delete Account
          </Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
