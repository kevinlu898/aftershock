import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FormField } from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRef, useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Text } from "../../components/ui/text";
import { db } from "../../lib/firebaseConfig";
import { getData } from "../../lib/storage/storageUtils";
import haptics from "../../lib/haptics";
import {
  compactErrors,
  validateEmail,
  validatePostalCode,
  validateRequired,
} from "../../lib/validation";
export default function ChangeDetails() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const showSkeleton = useDelayedSkeleton(initialLoading);
  const refs = {
    firstName: useRef(null),
    lastName: useRef(null),
    zipcode: useRef(null),
    phone: useRef(null),
    email: useRef(null),
  };
  useEffect(() => {
    (async () => {
      try {
        const username = await getData("username");
        if (!username) return;
        const q = query(collection(db, "user"), where("username", "==", username));
        const res = await getDocs(q);
        if (res.empty) return;
        const data = res.docs[0].data();
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setZipcode(data.zip_code || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
      } catch (error) {
        console.warn("Failed to load account details", error);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);
  const handleSave = () => {
    const nextErrors = compactErrors({
      firstName: validateRequired(firstName, "Enter your first name."),
      lastName: validateRequired(lastName, "Enter your last name."),
      zipcode: validatePostalCode(zipcode),
      email: validateEmail(email),
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      haptics.warning();
      const first = ["firstName", "lastName", "zipcode", "email"].find(
        (key) => nextErrors[key]
      );
      refs[first]?.current?.focus?.();
      return;
    }

    navigation.navigate("ConfirmPassword", {
      changeType: "details",
      changes: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        zipcode: zipcode.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
      },
    });
  };

  const update = (setter, key) => (value) => {
    setter(value);
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };
  if (initialLoading) {
    return showSkeleton ? <ScreenSkeleton cards={3} /> : <View className="flex-1 bg-background" />;
  }
  return <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView className="flex-1" contentContainerClassName="grow pb-[60px]" keyboardShouldPersistTaps="handled">
        <View className={"flex-1 p-[20px] bg-background"}>
          <Card className="gap-5">
            <Text className="text-body-sm text-muted-foreground">Keep your contact details current so local guidance and exports remain useful.</Text>
            <FormField label="First name" error={errors.firstName}>
              <Input
                ref={refs.firstName}
                placeholder="First name"
                value={firstName}
                onChangeText={update(setFirstName, "firstName")}
                autoComplete="given-name"
                textContentType="givenName"
                returnKeyType="next"
                onSubmitEditing={() => refs.lastName.current?.focus?.()}
              />
            </FormField>
            <FormField label="Last name" error={errors.lastName}>
              <Input
                ref={refs.lastName}
                placeholder="Last name"
                value={lastName}
                onChangeText={update(setLastName, "lastName")}
                autoComplete="family-name"
                textContentType="familyName"
                returnKeyType="next"
                onSubmitEditing={() => refs.zipcode.current?.focus?.()}
              />
            </FormField>
            <FormField label="Zip code" error={errors.zipcode}>
              <Input
                ref={refs.zipcode}
                placeholder="Zip code"
                value={zipcode}
                onChangeText={update(setZipcode, "zipcode")}
                keyboardType="number-pad"
                autoComplete="postal-code"
                textContentType="postalCode"
                maxLength={5}
                returnKeyType="next"
                onSubmitEditing={() => refs.phone.current?.focus?.()}
              />
            </FormField>
            <FormField label="Phone" description="Optional">
              <Input
                ref={refs.phone}
                placeholder="Phone"
                value={phone}
                onChangeText={update(setPhone, "phone")}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                returnKeyType="next"
                onSubmitEditing={() => refs.email.current?.focus?.()}
              />
            </FormField>
            <FormField label="Email" error={errors.email}>
              <Input
                ref={refs.email}
                placeholder="Email"
                value={email}
                onChangeText={update(setEmail, "email")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </FormField>

            <Button onPress={handleSave}>Save Changes</Button>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>;
}
