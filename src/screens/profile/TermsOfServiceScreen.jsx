import { Button } from "../../components/ui/button";
import { useNavigation } from '@react-navigation/native';
import { Linking, ScrollView, Text, View } from 'react-native';
export default function TermsOfService() {
  const navigation = useNavigation();
  const openLink = async url => {
    try {
      await Linking.openURL(url);
    } catch (_e) {
      // ignore
    }
  };
  return <View className={"flex-1 p-[20px] pt-[32px] bg-background"}>
      <Button unstyled onPress={() => navigation?.goBack?.()} className={[["mt-[10px] mb-[20px]"].filter(Boolean).join(" "), "mt-[20px] mb-[15px] self-start py-[8px] px-[12px] rounded-[12px] bg-card border border-border"].filter(Boolean).join(" ")}>
        <Text className={"text-primary font-bold"}>{"← Back"}</Text>
      </Button>

      <ScrollView>
        <View className={["bg-card p-[18px] rounded-[14px] border border-border shadow-sm", "mx-[6px]"].filter(Boolean).join(" ")}>
          <Text className={"text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"}>Terms of Service</Text>
          <Text className={"text-muted-foreground text-[13px] mt-[6px] mb-[12px]"}>Last updated: October 20, 2025</Text>

          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            Welcome to Aftershock (“the App”), operated by [Your Name or Company Name] (“we,” “us,” or “our”). These Terms of Service (“Terms”) govern your use of the Aftershock mobile app, website, and related services (“the Services”).
          </Text>

          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            By using Aftershock, you agree to these Terms. If you do not agree, please do not use the App.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>1. Purpose</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            Aftershock is designed to help users prepare for and respond to earthquakes and emergencies through educational tools, checklists, and personalized emergency plans. Aftershock provides informational guidance only. It does not guarantee safety or prevent harm during real emergencies.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>2. Eligibility</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            You must be at least 13 years old (or the minimum legal age in your country) to use Aftershock. By using the App, you confirm that you meet this requirement.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>3. User Accounts</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>Using our app requires you to create an account. By doing so, you agree to:</Text>
          <View className={"mt-[8px] ml-[12px]"}>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Provide accurate and up-to-date information.</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Keep your login credentials secure.</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Notify us immediately of any unauthorized use of your account.</Text>
          </View>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>You are responsible for all activity that occurs under your account.</Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>4. Acceptable Use</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>You agree to use Aftershock responsibly and lawfully. You may not:</Text>
          <View className={"mt-[8px] ml-[12px]"}>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Upload or share false, misleading, or harmful information.</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Interfere with the operation of the App or its servers.</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Attempt to reverse-engineer, decompile, or tamper with the App.</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Collect or share other users’ data without their consent.</Text>
          </View>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>We reserve the right to suspend or terminate access to anyone who violates these rules.</Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>5. Content</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}><Text className="font-bold">Your Content:</Text></Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            You may create and store personal emergency plans, contacts, and other information (“User Content”). You retain ownership of this content. By using the App, you give us permission to store and display your User Content only as needed to operate and improve the Services.
          </Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}><Text className="font-bold">Our Content:</Text></Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            All other materials in the App—including text, design, graphics, lessons, and videos—are owned by us or our partners. You may not copy, modify, or redistribute them without permission.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>6. Privacy</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            Your privacy is important to us. Please read our Privacy Policy to understand how we collect, use, and protect your data. Aftershock may store your data locally on your device or securely in encrypted databases. We never share your personal or emergency information without your explicit consent.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>7. Disclaimers</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            Aftershock provides educational and planning tools for informational use only. We make no guarantees that the App or its content will:
          </Text>
          <View className={"mt-[8px] ml-[12px]"}>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Prevent injury, loss, or damage during an actual emergency.</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Remain uninterrupted or error-free.</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Always reflect current emergency best practices.</Text>
          </View>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>Use Aftershock at your own discretion and always follow official local emergency instructions.</Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>8. Limitation of Liability</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            To the fullest extent allowed by law, we are not liable for any loss, damage, or injury resulting from:
          </Text>
          <View className={"mt-[8px] ml-[12px]"}>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Your reliance on the App’s content.</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Technical errors or data loss.</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Third-party links or integrations.</Text>
          </View>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>You agree to use Aftershock at your own risk.</Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>9. Changes to the Terms</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            We may update these Terms from time to time. If significant changes occur, we will notify you within the App or on our website. Continued use of Aftershock means you accept the updated Terms.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>10. Termination</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            You may stop using Aftershock at any time. We may suspend or terminate access if you violate these Terms or misuse the Services.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>11. Contact</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>If you have questions or concerns about these Terms, please contact us at:</Text>
          <Button unstyled onPress={() => openLink('mailto:support@aftershockapp.com')}>
            <Text className={"text-primary mt-[8px] font-semibold text-[14px]"}>Email: support@aftershockapp.com</Text>
          </Button>
          <Button unstyled onPress={() => openLink('https://www.aftershockapp.com')}>
            <Text className={"text-primary mt-[8px] font-semibold text-[14px]"}>Website: www.aftershockapp.com</Text>
          </Button>
        </View>
      </ScrollView>
    </View>;
}
