import { Button } from "../../components/ui/button";
import { AppIcon } from "../../components/app-icon";
import { PageHeader } from "../../components/app-ui";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from 'react';
import { Image, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getData } from "../../lib/storage/storageUtils";
export default function Landing() {
  const navigation = useNavigation();
  const {
    width
  } = useWindowDimensions();
  useEffect(() => {
    let mounted = true;

    // check login and redirect if already signed in
    getData('isLoggedIn').then(val => {
      if (!mounted) return;
      if (val === 'yes') navigation.replace('MainApp');
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, [navigation]);
  const onPress = () => {
    navigation.replace("AccountCreation");
  };
  const imageSize = Math.min(300, Math.max(120, width * 0.5));
  const benefits = [
    "Emergency planning",
    "Epicenter AI assistance",
    "Contact management",
    "Secure document access",
  ];
  return <SafeAreaView className={"flex-1 bg-background"} edges={["top", "bottom"]}>
      <View className={"flex-1 justify-between gap-[24px] px-[24px] py-[24px]"}>
        <PageHeader
          align="center"
          title="Ready starts here"
          description="Build a practical plan and keep critical information close when every second matters."
        />

        <View className={"flex-1 items-center justify-center gap-[24px]"}>
          <View className={"items-center"}>
            <Image source={require('../../../assets/images/favicon.png')} style={{
            width: imageSize,
            height: imageSize,
            borderRadius: 36
          }} resizeMode="cover" />
          </View>

          <View className={"w-[100%] max-w-[360px] gap-[12px] rounded-[18px] border border-border bg-card p-[20px] shadow-sm"}>
            {benefits.map((benefit) => (
              <View key={benefit} className="flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <AppIcon name="check" size={17} className="text-primary" />
                </View>
                <Text className={"flex-1 text-[15px] font-semibold text-secondary-foreground"}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={"items-center gap-[12px] pb-[4px]"}>
          <Button onPress={onPress} className={"w-[100%] max-w-[360px]"} activeOpacity={0.8}>
            Get Started
          </Button>

          <Button variant="ghost" onPress={() => navigation.navigate('Login')} className="w-[100%] max-w-[360px]">
            <Text className={"text-sm text-muted-foreground text-center"}>
              Already have an account? <Text className={"text-primary font-bold"}>Log in</Text>
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>;
}
