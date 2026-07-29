import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FormField, StatusCard } from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { db } from "../../lib/firebaseConfig";
import { backendHash } from "../../lib/api";
import { clearData, getData, storeData } from "../../lib/storage/storageUtils";
export default function ChangeDetails() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
  const handleSave = async () => {
    if (!currentPassword || currentPassword.length === 0) {
      Alert.alert("Error", "Enter your current password to confirm.");
      return;
    }
    setLoading(true);
    try {
      const username = await getData("username");
      if (!username) {
        Alert.alert("Error", "No username found.");
        setLoading(false);
        return;
      }
      const q = query(collection(db, "user"), where("username", "==", username));
      const res = await getDocs(q);
      if (res.empty) {
        Alert.alert("Error", "User not found.");
        setLoading(false);
        return;
      }
      const docRef = res.docs[0].ref;
      const userData = res.docs[0].data();
      const ch = await backendHash(currentPassword);
      if (!ch || userData.password_hash !== ch) {
        Alert.alert("Error", "Current password is incorrect.");
        setLoading(false);
        return;
      }
      await updateDoc(docRef, {
        first_name: firstName,
        last_name: lastName,
        zip_code: zipcode,
        phone_number: phone,
        email: email
      });
      await storeData("firstname", firstName);
      await storeData("postalcode", zipcode);
      await storeData("email", email);
      await clearData("riskdata");
      Alert.alert("Success", "Details updated.");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save details.");
    } finally {
      setLoading(false);
    }
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

            <StatusCard title="Confirm changes" description="Enter your current password before saving.">
              <Input placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry accessibilityLabel="Confirm current password" />
            </StatusCard>

            <Button onPress={handleSave} loading={loading}>Save Changes</Button>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>;
}
