import { useNavigation } from "@react-navigation/native";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { FormField } from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Text } from "../../components/ui/text";
import haptics from "../../lib/haptics";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function ChangeUsername() {
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const inputRef = useRef(null);

  const handleSave = () => {
    const value = newUsername.trim();
    let message = null;
    if (!value) message = "Enter a new username.";
    else if (value.length < 3) message = "Use at least 3 characters.";
    else if (value.length > 20) message = "Use 20 characters or fewer.";
    else if (!USERNAME_RE.test(value)) {
      message = "Letters, numbers and underscores only.";
    }

    if (message) {
      setError(message);
      haptics.warning();
      inputRef.current?.focus?.();
      return;
    }

    navigation.navigate("ConfirmPassword", {
      changeType: "username",
      changes: { newUsername: value },
    });
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
            Choose a new username. It must be at least 3 characters and unique.
          </Text>
          <FormField label="New username" error={error}>
            <Input
              ref={inputRef}
              placeholder="New username"
              value={newUsername}
              onChangeText={(value) => {
                setNewUsername(value);
                if (error) setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </FormField>
          <Button onPress={handleSave}>Save Username</Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
