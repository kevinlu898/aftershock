import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  FormField,
  PageHeader,
  Screen,
} from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PasswordInput } from "../../components/ui/password-input";
import { Text } from "../../components/ui/text";
import { useToast } from "../../components/ui/toast";
import { backendHash } from "../../lib/api";
import { db } from "../../lib/firebaseConfig";
import haptics from "../../lib/haptics";
import { fillData, storeData } from "../../lib/storage/storageUtils";
import { compactErrors, validateEmail } from "../../lib/validation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleVerify = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const nextErrors = compactErrors({
      email: validateEmail(normalizedEmail),
      password: password ? null : "Enter your password.",
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      haptics.warning();
      (nextErrors.email ? emailRef : passwordRef).current?.focus?.();
      return;
    }

    setSubmitting(true);
    try {
      const results = await getDocs(
        query(collection(db, "user"), where("email", "==", normalizedEmail))
      );
      const account = results.docs[0]?.data();
      const passwordHash = await backendHash(password);

      if (!account || account.password_hash !== passwordHash) {
        setErrors({ password: "That email and password don’t match." });
        haptics.error();
        return;
      }

      const accountIdentifier = account.username || normalizedEmail;
      await storeData("isLoggedIn", "yes");
      await storeData("username", accountIdentifier);
      await storeData("email", normalizedEmail);
      await fillData(accountIdentifier);
      haptics.success();
      // Let the gate decide: already-onboarded accounts go straight to the app,
      // everyone else lands in setup.
      navigation.replace("BootGate");
    } catch (error) {
      console.warn("Login failed", error);
      toast.error("Couldn’t sign you in", {
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
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerClassName="grow justify-center gap-6 px-6 py-8"
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center gap-5">
              <Image
                source={require("../../../assets/images/favicon.png")}
                className="h-[104px] w-[104px] rounded-[24px] border border-border"
                accessibilityLabel=""
              />
              <PageHeader
                align="center"
                title="Log in to Aftershock"
                description="Continue your earthquake preparedness journey."
              />
            </View>

            <FormField label="Email" error={errors.email}>
              <Input
                ref={emailRef}
                placeholder="Enter your email"
                value={email}
                onChangeText={update(setEmail, "email")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus?.()}
              />
            </FormField>

            <FormField label="Password" error={errors.password}>
              <PasswordInput
                ref={passwordRef}
                placeholder="Enter password"
                value={password}
                onChangeText={update(setPassword, "password")}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleVerify}
              />
            </FormField>

            <Button onPress={handleVerify} loading={submitting}>
              Log In
            </Button>

            <Button
              variant="ghost"
              onPress={() => navigation.replace("AccountCreation")}
            >
              <Text className="text-center text-body-sm font-semibold text-primary">
                Create an account
              </Text>
            </Button>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}
