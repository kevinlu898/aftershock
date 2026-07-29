import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FormField, PageHeader } from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableWithoutFeedback, View } from "react-native";
import { db } from "../../lib/firebaseConfig";
import { backendHash } from "../../lib/api";
import { fillData, storeData } from "../../lib/storage/storageUtils";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const handleVerify = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert("Missing information", "Enter your email and password.");
      return;
    }
    const results = await getDocs(
      query(collection(db, "user"), where("email", "==", normalizedEmail))
    );
    const account = results.docs[0]?.data();
    const passwordHash = await backendHash(password);
    if (account && account.password_hash === passwordHash) {
      const accountIdentifier = account.username || normalizedEmail;
      Alert.alert("Success", "You are logged in!");
      await storeData("isLoggedIn", "yes");
      await storeData("username", accountIdentifier);
      await storeData("email", normalizedEmail);
      await fillData(accountIdentifier);
      navigation.replace("MainApp");
    } else {
      Alert.alert("Login failed", "Check your email and password.");
    }
  };
  return <View className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerClassName="grow justify-center gap-[24px] px-[24px] py-[32px]" contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View className={"items-center gap-[20px]"}>
              <Image source={require("../../../assets/images/favicon.png")} className={"w-[104px] h-[104px] rounded-[24px] border border-border"} />
              <PageHeader
                align="center"
                title="Log in to Aftershock"
                description="Access your preparedness plan and emergency information."
              />
            </View>

            <Card className={"w-[100%] max-w-[420px] self-center gap-[18px]"}>
              <FormField label="Email">
                <Input className="h-12 py-0" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
              </FormField>

              <FormField label="Password">
                <Input className="h-12 py-0" placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry returnKeyType="done" onSubmitEditing={handleVerify} />
              </FormField>

              <Button onPress={handleVerify}>Log In</Button>

              <Button variant="ghost" onPress={() => navigation.replace("AccountCreation")}>
                <Text className={"text-primary text-center font-semibold text-sm"}>Create an account</Text>
              </Button>
            </Card>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>;
}
