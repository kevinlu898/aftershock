import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useNavigation } from "@react-navigation/native";
import { and, collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TouchableWithoutFeedback, View } from "react-native";
import { db } from "../../lib/firebaseConfig";
import { backendHash } from "../../lib/api";
import { fillData, storeData } from "../../lib/storage/storageUtils";
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const handleVerify = async () => {
    const userTable = collection(db, "user");
    const thehash = await backendHash(password);
    const queryToCheck = query(userTable, and(where("username", "==", username), where("password_hash", "==", thehash)));
    const results = await getDocs(queryToCheck);
    if (!results.empty) {
      Alert.alert("Success", "You are logged in!");
      await storeData("isLoggedIn", "yes");
      await storeData("username", username);
      await fillData(username);
      navigation.replace("MainApp");
    } else {
      Alert.alert("Error", "Either your username or password is wrong. Try creating a new account...");
    }
  };
  const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24;
  return <View className="flex-1 bg-background">
      <View className={["bg-background w-[100%] absolute top-0 left-0 z-[1000]"].filter(Boolean).join(" ")} style={{
      height: statusBarHeight
    }} />

      

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerClassName={["p-[24px] grow justify-center pb-0"].filter(Boolean).join(" ")} contentContainerStyle={{
          paddingTop: statusBarHeight + 18
        }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View className={"items-center mb-[32px]"}>
              <Text className={"text-base font-bold text-primary text-center mb-[20px] leading-[32px]"}>Welcome back to Aftershock!</Text>
              <Image source={require("../../../assets/images/favicon.png")} className={"w-[100px] h-[100px] rounded-[20px] border border-border"} />
            </View>

            <View className={"w-[100%] max-w-[400px] self-center"}>
              <Text className={"text-base text-foreground text-left mb-[6px] mt-[12px] font-semibold"}>Username:</Text>
              <Input className={"h-[50px] border-border border rounded-[12px] px-[16px] mb-[18px] text-base bg-card text-foreground"} placeholder="Enter Username" value={username} onChangeText={setUsername} autoCapitalize="none" returnKeyType="next" />

              <Text className={"text-base text-foreground text-left mb-[6px] mt-[12px] font-semibold"}>Password:</Text>
              <Input className={"h-[50px] border-border border rounded-[12px] px-[16px] mb-[18px] text-base bg-card text-foreground"} placeholder="Enter Password" value={password} onChangeText={setPassword} secureTextEntry returnKeyType="done" onSubmitEditing={handleVerify} />

              <Button unstyled className={"bg-primary py-[14px] rounded-[12px] mt-[16px] shadow-sm"} onPress={handleVerify}>
                <Text className={"text-primary-foreground text-base text-center font-bold"}>Next</Text>
              </Button>

              <Button unstyled onPress={() => navigation.replace("AccountCreation")} className={"mt-[20px] p-[8px]"}>
                <Text className={"text-primary text-center font-medium text-base"}>I do not have an account</Text>
              </Button>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>;
}
