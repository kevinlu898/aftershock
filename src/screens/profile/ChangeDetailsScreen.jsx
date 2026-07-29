import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
  useEffect(() => {
    (async () => {
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
  return <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView className="flex-1" contentContainerClassName="grow pb-[60px]" keyboardShouldPersistTaps="handled">
        <View className={"flex-1 p-[20px] pt-[32px] bg-background"}>
          <Button unstyled onPress={() => navigation?.goBack?.()} className={"mt-[20px] mb-[15px] self-start py-[8px] px-[12px] rounded-[12px] bg-card border border-border"}>
            <Text className={"text-primary font-bold"}>{"← Back"}</Text>
          </Button>

          <View className={"bg-card p-[18px] rounded-[14px] shadow-sm mb-[12px]"}>
            <Text className={"text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"}>Change Details</Text>
            <Text className={"text-foreground mb-[8px] font-semibold"}>First Name</Text>
            <Input placeholder="First name" value={firstName} onChangeText={setFirstName} className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} />
            <Text className={"text-foreground mb-[8px] font-semibold"}>Last Name</Text>
            <Input placeholder="Last name" value={lastName} onChangeText={setLastName} className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} />
            <Text className={"text-foreground mb-[8px] font-semibold"}>Zip Code</Text>
            <Input placeholder="Zip code" value={zipcode} onChangeText={setZipcode} className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} keyboardType="number-pad" />
            <Text className={"text-foreground mb-[8px] font-semibold"}>Phone</Text>
            <Input placeholder="Phone" value={phone} onChangeText={setPhone} className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} keyboardType="phone-pad" />
            <Text className={"text-foreground mb-[8px] font-semibold"}>Email</Text>
            <Input placeholder="Email" value={email} onChangeText={setEmail} className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} keyboardType="email-address" autoCapitalize="none" />

            <View className={"border border-border bg-muted p-[12px] rounded-[10px] mb-[12px]"}>
              <Text className={"font-bold text-secondary-foreground mb-[6px]"}>Enter password</Text>
              <Text className={"text-foreground mb-[8px] font-semibold"}>
                Enter your password to confirm your changes
              </Text>
              <Input placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry className={"min-h-[44px] border border-border rounded-[8px] px-[10px] bg-card mt-[6px]"} accessibilityLabel="Confirm current password" />
            </View>

            <Button unstyled onPress={handleSave} className="bg-primary rounded-[12px] p-[14px]" disabled={loading}>
              <Text className="text-primary-foreground text-center">
                {loading ? "Saving..." : "Save"}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>;
}
