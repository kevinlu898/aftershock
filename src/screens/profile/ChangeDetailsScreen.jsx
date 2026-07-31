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
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { db } from "../../lib/firebaseConfig";
import { getData } from "../../lib/storage/storageUtils";
export default function ChangeDetails() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const showSkeleton = useDelayedSkeleton(initialLoading);
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
    navigation.navigate("ConfirmPassword", {
      changeType: "details",
      changes: { firstName, lastName, zipcode, phone, email },
    });
  };
  if (initialLoading) {
    return showSkeleton ? <ScreenSkeleton cards={3} /> : <View className="flex-1 bg-background" />;
  }
  return <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView className="flex-1" contentContainerClassName="grow pb-[60px]" keyboardShouldPersistTaps="handled">
        <View className={"flex-1 p-[20px] bg-background"}>
          <Card className="gap-5">
            <Text className="text-sm leading-5 text-muted-foreground">Keep your contact details current so local guidance and exports remain useful.</Text>
            <FormField label="First name">
              <Input placeholder="First name" value={firstName} onChangeText={setFirstName} />
            </FormField>
            <FormField label="Last name">
              <Input placeholder="Last name" value={lastName} onChangeText={setLastName} />
            </FormField>
            <FormField label="Zip code">
              <Input placeholder="Zip code" value={zipcode} onChangeText={setZipcode} keyboardType="number-pad" />
            </FormField>
            <FormField label="Phone">
              <Input placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </FormField>
            <FormField label="Email">
              <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </FormField>

            <Button onPress={handleSave}>Save Changes</Button>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>;
}
