import { Button } from "../../components/ui/button";
import { useNavigation } from '@react-navigation/native';
import { Linking, ScrollView, Text, View } from 'react-native';
export default function PrivacyPolicy() {
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
          <Text className={"text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"}>Privacy Policy</Text>
          <Text className={"text-muted-foreground text-[13px] mt-[6px] mb-[12px]"}>Last updated: October 20, 2025</Text>

          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            Aftershock is an earthquake preparedness app, and your privacy matters to us. 
            This Privacy Policy explains what information we collect, how we use it, and what rights you have.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>1. Information We Collect</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            We collect information only to make Aftershock work properly and keep your data secure.
          </Text>

          <Text className={["text-secondary-foreground text-[14px] leading-[20px] mt-[8px]", "font-bold mt-[12px]"].filter(Boolean).join(" ")}>1.1 Information You Provide</Text>
          <View className={"mt-[8px] ml-[12px]"}>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Account details (like your name, email, or password)</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Emergency plans and contact info you save within the app</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Uploaded documents (like identification, insurance forms, or checklists)</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• AI chat messages or inputs used for preparedness advice</Text>
          </View>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>All of this data stays private to your account and is never sold or publicly shared.</Text>

          <Text className={["text-secondary-foreground text-[14px] leading-[20px] mt-[8px]", "font-bold mt-[12px]"].filter(Boolean).join(" ")}>1.2 Automatically Collected Information</Text>
          <View className={"mt-[8px] ml-[12px]"}>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• App version and usage analytics (for debugging and updates)</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Device type and operating system</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Crash reports or error logs</Text>
          </View>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            We do not track your exact location unless you enable location-based features (like regional earthquake alerts).
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>2. How We Use Your Information</Text>
          <View className={"mt-[8px] ml-[12px]"}>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Provide and personalize app features</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Help you save and organize emergency plans</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Respond to feedback or support requests</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Improve app performance and reliability</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Securely store encrypted documents and data</Text>
          </View>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>We never use your data for advertising or marketing without consent.</Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>3. Data Storage and Security</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            Your privacy and safety are our top priorities. All sensitive data is encrypted before storage and when transmitted.
            If cloud backups are enabled, they are also encrypted at rest. We use strong security practices to prevent unauthorized access.
            You can delete your account or data anytime in settings.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>4. AI and Data Handling</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            Aftershock may use AI features to generate preparedness suggestions or summarize your plans.
            AI responses are generated from your inputs and context, but your personal data is never used to train external models.
            Temporary data is processed securely and deleted after use.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>5. Sharing Your Information</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            We do not sell, rent, or trade your personal data. We may share limited information only to:
          </Text>
          <View className={"mt-[8px] ml-[12px]"}>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Comply with legal obligations</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Provide secure cloud or AI services</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Protect user safety and prevent misuse</Text>
          </View>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            All third parties must follow strict privacy and data protection standards.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>6. Your Rights</Text>
          <View className={"mt-[8px] ml-[12px]"}>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Access or export your saved data</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Edit or delete your personal information</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Request permanent data deletion</Text>
            <Text className={"text-secondary-foreground text-[14px] leading-[20px] mb-[6px]"}>• Disable analytics or AI features in settings</Text>
          </View>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            To exercise these rights, do so within the app or contact us at privacy@aftershockapp.com.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>7. Children’s Privacy</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            Aftershock is intended for users aged 13 and older. We do not knowingly collect data from children under 13. 
            If we learn a child has provided information, we delete it immediately.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>8. Changes to This Policy</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>
            We may update this Privacy Policy occasionally. When we do, we’ll post the new version here and update the “Last Updated” date.
          </Text>

          <Text className={"text-[16px] font-bold text-secondary-foreground mt-[18px] mb-[6px]"}>9. Contact Us</Text>
          <Text className={"text-secondary-foreground text-[14px] leading-[20px] mt-[8px]"}>If you have any questions or concerns about privacy, contact us:</Text>
          <Button unstyled onPress={() => openLink('mailto:privacy@aftershockapp.com')}>
            <Text className={"text-primary mt-[8px] font-semibold text-[14px]"}>Email: privacy@aftershockapp.com</Text>
          </Button>
          <Button unstyled onPress={() => openLink('https://www.aftershockapp.com')}>
            <Text className={"text-primary mt-[8px] font-semibold text-[14px]"}>Website: www.aftershockapp.com</Text>
          </Button>
        </View>
      </ScrollView>
    </View>;
}
