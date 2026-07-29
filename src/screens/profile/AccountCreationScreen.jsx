import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { useNavigation } from "@react-navigation/native";
import { addDoc, collection, getDocs, or, query, where } from "firebase/firestore";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, View } from "react-native";
import { db } from "../../lib/firebaseConfig";
import { backendHash } from "../../lib/api";
import { storeData } from "../../lib/storage/storageUtils";
export default function AccountFlow() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [termsAgree, setTermsAgree] = useState(false);

  // Refs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const lastNameRef = useRef(null);
  const zipRef = useRef(null);
  const phoneRef = useRef(null);
  const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24;
  const addUser = async () => {
    try {
      const thehash = await backendHash(password);
      await addDoc(collection(db, "user"), {
        username,
        email,
        password_hash: thehash,
        first_name: firstName,
        last_name: lastName,
        zip_code: zipCode,
        phone_number: phoneNumber
      });
      storeData("isLoggedIn", "yes");
      storeData("username", username);
      storeData("email", email);
      storeData("firstname", firstName);
      storeData("postalcode", zipCode);
    } catch (e) {
      console.error("Error adding document:", e);
    }
  };
  const handleNext = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (username.length < 3 || username.length > 20) {
      Alert.alert("Error", "Username must be 3-20 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      Alert.alert("Error", "Username must only contain letters, numbers, or underscores.");
      return;
    }
    if (!email.includes("@") || !email.includes(".") || email.length < 5) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    const queryToCheck = query(collection(db, "user"), or(where("username", "==", username), where("email", "==", email)));
    const results = await getDocs(queryToCheck);
    if (!results.empty) {
      Alert.alert("Error", "Username or email already used. Try again.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      Alert.alert("Error", "Password must contain a mix of uppercase and lowercase letters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setStep(2);
  };
  const handleCreateAccount = async () => {
    if (!firstName || !lastName || !zipCode || !phoneNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (!/^\d{5}$/.test(zipCode)) {
      Alert.alert("Error", "Please enter a valid 5-digit zip code");
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }
    const queryToCheck = query(collection(db, "user"), where("phone_number", "==", phoneNumber));
    const results = await getDocs(queryToCheck);
    if (!results.empty) {
      Alert.alert("Error", "Phone number already used.");
      return;
    }
    if (!termsAgree) {
      Alert.alert("Error", "You must agree to the Terms & Privacy Policy");
      return;
    }
    await addUser();
    Alert.alert("Success", `Welcome ${username}! Account created.`);
    navigation.navigate("MainApp");
  };
  const handleNavigateToLogin = () => {
    navigation.replace("Login");
  };
  const openPrivacy = () => navigation.navigate("PrivacyPolicy");
  const openTos = () => navigation.navigate("TermsOfService");
  return <View className="flex-1 bg-background">
      {/* Status Bar Background */}
      <View className={["bg-background w-[100%] absolute top-0 left-0 z-[1000]"].filter(Boolean).join(" ")} style={{
      height: statusBarHeight
    }} />

      

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : statusBarHeight}>
        <ScrollView contentContainerClassName={["p-[24px] grow", "pb-[40px]"].filter(Boolean).join(" ")} contentContainerStyle={{
        paddingTop: statusBarHeight + 18
      }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 1 ? <>
              <Text className={[["mt-[10px] mb-[28px] text-center"].filter(Boolean).join(" "), "text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"].filter(Boolean).join(" ")}>
                Create New Account
              </Text>

              <Text className={"text-base text-foreground mb-[4px] font-semibold"}>Username:</Text>
              <Input className={"h-[50px] border-border border rounded-[12px] px-[14px] mb-[18px] text-base bg-card text-foreground"} placeholder="Enter Username" value={username} onChangeText={setUsername} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => emailRef.current?.focus()} />

              <Text className={"text-base text-foreground mb-[4px] font-semibold"}>Email:</Text>
              <Input ref={emailRef} className={"h-[50px] border-border border rounded-[12px] px-[14px] mb-[18px] text-base bg-card text-foreground"} placeholder="Enter Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => passwordRef.current?.focus()} />

              <Text className={"text-base text-foreground mb-[4px] font-semibold"}>Password:</Text>
              <Input ref={passwordRef} className={"h-[50px] border-border border rounded-[12px] px-[14px] mb-[18px] text-base bg-card text-foreground"} placeholder="Enter Password" value={password} onChangeText={setPassword} secureTextEntry returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => confirmPasswordRef.current?.focus()} />

              <Text className={"text-base text-foreground mb-[4px] font-semibold"}>Confirm Password:</Text>
              <Input ref={confirmPasswordRef} className={"h-[50px] border-border border rounded-[12px] px-[14px] mb-[18px] text-base bg-card text-foreground"} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry returnKeyType="done" onSubmitEditing={handleNext} />

              <Button unstyled className={"bg-primary py-[14px] rounded-[12px] mt-[10px] shadow-sm"} onPress={handleNext}>
                <Text className={"text-primary-foreground text-base text-center font-bold"}>Next</Text>
              </Button>

              <Button unstyled onPress={handleNavigateToLogin} className={"mt-[20px]"}>
                <Text className={"text-primary text-center font-medium"}>I already have an account</Text>
              </Button>
            </> : <View>
              <Text className={[["mt-[10px] mb-[28px] text-center"].filter(Boolean).join(" "), "text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"].filter(Boolean).join(" ")}>
                Enter Your Details
              </Text>

              <Button unstyled onPress={() => setStep(1)} className={"mb-[12px] self-start py-[8px] px-[12px] rounded-[12px] bg-card border border-border"}>
                <Text className={"text-primary text-base font-bold"}>{"← Back"}</Text>
              </Button>

              <View className={"flex-row justify-between gap-[8px]"}>
                <View className={"flex-1"}>
                  <Text className={"text-base text-foreground mb-[4px] font-semibold"}>First Name:</Text>
                  <Input className={"h-[50px] border-border border rounded-[12px] px-[14px] mb-[18px] text-base bg-card text-foreground"} placeholder="Enter First Name" value={firstName} onChangeText={setFirstName} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => lastNameRef.current?.focus()} />
                </View>

                <View className={"flex-1"}>
                  <Text className={"text-base text-foreground mb-[4px] font-semibold"}>Last Name:</Text>
                  <Input ref={lastNameRef} className={"h-[50px] border-border border rounded-[12px] px-[14px] mb-[18px] text-base bg-card text-foreground"} placeholder="Enter Last Name" value={lastName} onChangeText={setLastName} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => zipRef.current?.focus()} />
                </View>
              </View>

              <Text className={"text-base text-foreground mb-[4px] font-semibold"}>Zip Code:</Text>
              <Input ref={zipRef} className={"h-[50px] border-border border rounded-[12px] px-[14px] mb-[18px] text-base bg-card text-foreground"} placeholder="Enter Zip Code" value={zipCode} onChangeText={setZipCode} keyboardType="numeric" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => phoneRef.current?.focus()} />

              <Text className={"text-base text-foreground mb-[4px] font-semibold"}>Phone Number:</Text>
              <Input ref={phoneRef} className={"h-[50px] border-border border rounded-[12px] px-[14px] mb-[18px] text-base bg-card text-foreground"} placeholder="Enter Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" returnKeyType="done" onSubmitEditing={handleCreateAccount} />

              <View className={"flex-row items-center my-[12px]"}>
                <Checkbox checked={termsAgree} onCheckedChange={setTermsAgree} />
                <Text className={"ml-[8px] text-base text-foreground flex-1 leading-[20px]"}>
                  I agree to the{" "}
                  <Text className={"text-primary font-bold underline"} onPress={openTos}>
                    Terms of Service
                  </Text>{" "}
                  &amp;{" "}
                  <Text className={"text-primary font-bold underline"} onPress={openPrivacy}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>

              <Button unstyled className={"bg-primary py-[14px] rounded-[12px] mt-[10px] shadow-sm"} onPress={handleCreateAccount}>
                <Text className={"text-primary-foreground text-base text-center font-bold"}>Sign Up</Text>
              </Button>
            </View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>;
}
