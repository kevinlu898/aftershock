import { useNavigation } from "@react-navigation/native";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  BackButton,
  FormField,
  PageHeader,
} from "../../components/app-ui";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { backendHash } from "../../lib/api";
import { db } from "../../lib/firebaseConfig";
import { storeData } from "../../lib/storage/storageUtils";

export default function AccountFlow() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [termsAgree, setTermsAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const phoneRef = useRef(null);

  const normalizedEmail = email.trim().toLowerCase();

  const validateIdentity = async () => {
    if (!name.trim() || !normalizedEmail) {
      Alert.alert("Missing information", "Enter your name and email.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return false;
    }
    try {
      const existing = await getDocs(
        query(collection(db, "user"), where("email", "==", normalizedEmail))
      );
      if (!existing.empty) {
        Alert.alert("Email already used", "Log in or use another email address.");
        return false;
      }
    } catch (error) {
      console.warn("Account email check failed", error);
      Alert.alert("Unable to continue", "We could not verify that email. Try again.");
      return false;
    }
    return true;
  };

  const handleIdentityNext = async () => {
    if (await validateIdentity()) setStep(2);
  };

  const handlePasswordNext = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Missing password", "Enter and confirm your password.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      Alert.alert(
        "Password needs more variety",
        "Include uppercase and lowercase letters."
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Re-enter your password confirmation.");
      return;
    }
    setStep(3);
  };

  const handleCreateAccount = async () => {
    const digitsOnlyPhone = phoneNumber.replace(/\D/g, "");
    if (!/^\d{5}$/.test(zipCode)) {
      Alert.alert("Invalid zip code", "Enter a valid 5-digit zip code.");
      return;
    }
    if (!/^\d{10}$/.test(digitsOnlyPhone)) {
      Alert.alert("Invalid phone number", "Enter a valid 10-digit phone number.");
      return;
    }
    if (!termsAgree) {
      Alert.alert(
        "Agreement required",
        "Agree to the Terms of Service and Privacy Policy to continue."
      );
      return;
    }

    setSubmitting(true);
    try {
      const existingPhone = await getDocs(
        query(
          collection(db, "user"),
          where("phone_number", "==", digitsOnlyPhone)
        )
      );
      if (!existingPhone.empty) {
        Alert.alert("Phone number already used", "Use another phone number.");
        return;
      }

      const passwordHash = await backendHash(password);
      await addDoc(collection(db, "user"), {
        username: normalizedEmail,
        email: normalizedEmail,
        password_hash: passwordHash,
        first_name: name.trim(),
        last_name: "",
        zip_code: zipCode,
        phone_number: digitsOnlyPhone,
      });

      await Promise.all([
        storeData("isLoggedIn", "yes"),
        storeData("username", normalizedEmail),
        storeData("email", normalizedEmail),
        storeData("firstname", name.trim()),
        storeData("postalcode", zipCode),
      ]);
      Alert.alert("Account created", `Welcome, ${name.trim()}!`);
      navigation.replace("MainApp");
    } catch (error) {
      console.error("Error creating account", error);
      Alert.alert("Account not created", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openPrivacy = () => navigation.navigate("PrivacyPolicy");
  const openTos = () => navigation.navigate("TermsOfService");

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="grow px-5 py-5"
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[420px] self-center gap-5 pb-8">
            <Badge variant="secondary" className="self-start">
              <Text>{`Step ${step} of 3`}</Text>
            </Badge>

            {step === 1 ? (
              <>
                <PageHeader
                  title="Create your account"
                  description="Tell us how to address you and where to send account information."
                />
                <View className="gap-4">
                  <FormField label="Name">
                    <Input
                      className="h-12 py-0"
                      placeholder="Enter your name"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                  </FormField>
                  <FormField label="Email">
                    <Input
                      ref={emailRef}
                      className="h-12 py-0"
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleIdentityNext}
                    />
                  </FormField>
                </View>
                <Button onPress={handleIdentityNext}>Continue</Button>
                <Button
                  variant="ghost"
                  onPress={() => navigation.replace("Login")}
                >
                  <Text className="text-sm font-semibold text-primary">
                    I already have an account
                  </Text>
                </Button>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <BackButton onPress={() => setStep(1)} />
                <PageHeader
                  title="Create a password"
                  description="Use at least 8 characters with uppercase and lowercase letters."
                />
                <View className="gap-4">
                  <FormField label="Password">
                    <Input
                      className="h-12 py-0"
                      placeholder="Enter a password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        confirmPasswordRef.current?.focus()
                      }
                    />
                  </FormField>
                  <FormField label="Confirm password">
                    <Input
                      ref={confirmPasswordRef}
                      className="h-12 py-0"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      returnKeyType="done"
                      onSubmitEditing={handlePasswordNext}
                    />
                  </FormField>
                </View>
                <Button onPress={handlePasswordNext}>Continue</Button>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <BackButton onPress={() => setStep(2)} />
                <PageHeader
                  title="Contact details"
                  description="Use the location and phone number you want associated with your preparedness plan."
                />
                <View className="gap-4">
                  <FormField label="Zip code">
                    <Input
                      className="h-12 py-0"
                      placeholder="5-digit zip code"
                      value={zipCode}
                      onChangeText={setZipCode}
                      keyboardType="number-pad"
                      maxLength={5}
                      returnKeyType="next"
                      onSubmitEditing={() => phoneRef.current?.focus()}
                    />
                  </FormField>
                  <FormField label="Phone number">
                    <Input
                      ref={phoneRef}
                      className="h-12 py-0"
                      placeholder="10-digit phone number"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      returnKeyType="done"
                    />
                  </FormField>
                </View>

                <View className="flex-row items-start gap-3 rounded-xl bg-secondary/60 p-4">
                  <Checkbox
                    checked={termsAgree}
                    onCheckedChange={setTermsAgree}
                    accessibilityLabel="Agree to Terms of Service and Privacy Policy"
                  />
                  <Text className="flex-1 text-sm leading-5 text-foreground">
                    I agree to the{" "}
                    <Text
                      className="font-semibold text-primary"
                      onPress={openTos}
                    >
                      Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text
                      className="font-semibold text-primary"
                      onPress={openPrivacy}
                    >
                      Privacy Policy
                    </Text>
                    .
                  </Text>
                </View>

                <Button
                  onPress={handleCreateAccount}
                  loading={submitting}
                >
                  Create Account
                </Button>
              </>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
