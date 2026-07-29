import { Button } from "../../components/ui/button";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from 'react';
import { Image, SafeAreaView, Text, useWindowDimensions, View } from "react-native";
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
  return <SafeAreaView className={"flex-1 bg-background"}>
      <View className={"flex-1 px-[24px] py-[20px] justify-between"}>
        <View className={"items-center mt-[18px]"}>
          <Text className={"text-[42px] font-extrabold text-primary text-center mb-[6px]"}>Aftershock</Text>
          <Text className={"text-[16px] text-secondary-foreground font-medium text-center"}>Earthquake Preparedness App</Text>
        </View>

        <View className={"flex-1 justify-center items-center"}>
          <View className={"items-center mb-[24px]"}>
            <Image source={require('../../../assets/images/favicon.png')} className={"shadow-sm"} style={{
            width: imageSize,
            height: imageSize
          }} resizeMode="cover" />
          </View>

          <View className={"mt-[4px] items-start bg-[rgba(255,255,255,0.72)] border border-border rounded-[18px] p-[16px] w-[100%] max-w-[320px]"}>
            <Text className={"text-[15px] text-secondary-foreground font-medium mb-[7px]"}>• Emergency Planning</Text>
            <Text className={"text-[15px] text-secondary-foreground font-medium mb-[7px]"}>• Epicenter AI Assistance</Text>
            <Text className={"text-[15px] text-secondary-foreground font-medium mb-[7px]"}>• Contact Management</Text>
            <Text className={"text-[15px] text-secondary-foreground font-medium mb-[7px]"}>• Document Storage</Text>
          </View>
        </View>

        <View className={"items-center pb-[8px]"}>
          <Text className={"text-[14px] text-secondary-foreground text-center mb-[20px] leading-[20px] font-medium"}>
            Your comprehensive earthquake preparedness companion
          </Text>
          
          <Button unstyled onPress={onPress} className={"bg-primary py-[14px] px-[28px] rounded-[14px] w-[100%] max-w-[260px] shadow-sm mb-[14px]"} activeOpacity={0.8}>
              <Text className={"text-primary-foreground text-[16px] font-bold text-center"}>Get Started</Text>
          </Button>

          <Button unstyled onPress={() => navigation.navigate('Login')} className={"p-[6px]"}>
            <Text className={"text-[13px] text-muted-foreground text-center"}>
              Already have an account? <Text className={"text-primary font-semibold"}>Log In</Text>
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>;
}
