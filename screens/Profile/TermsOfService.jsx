import { useNavigation } from '@react-navigation/native';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, globalStyles } from '../../css';

export default function TermsOfService() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (_e) {
      // ignore
    }
  };

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity onPress={() => navigation?.goBack?.()} style={[globalStyles.backButton, { marginTop: 10, marginBottom: 20 }]}>
        <Text style={globalStyles.backButtonText}>{"← Back"}</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={[styles.card, { marginHorizontal: 6 }]}>
          <Text style={globalStyles.heading}>Terms of Service</Text>
          <Text style={styles.meta}>Last updated: October 20, 2025</Text>

          <Text style={styles.p}>
            Welcome to Aftershock (“the App”), operated by [Your Name or Company Name] (“we,” “us,” or “our”). These Terms of Service (“Terms”) govern your use of the Aftershock mobile app, website, and related services (“the Services”).
          </Text>

          <Text style={styles.p}>
            By using Aftershock, you agree to these Terms. If you do not agree, please do not use the App.
          </Text>

          <Text style={styles.h2}>1. Purpose</Text>
          <Text style={styles.p}>
            Aftershock is designed to help users prepare for and respond to earthquakes and emergencies through educational tools, checklists, and personalized emergency plans. Aftershock provides informational guidance only. It does not guarantee safety or prevent harm during real emergencies.
          </Text>

          <Text style={styles.h2}>2. Eligibility</Text>
          <Text style={styles.p}>
            You must be at least 13 years old (or the minimum legal age in your country) to use Aftershock. By using the App, you confirm that you meet this requirement.
          </Text>

          <Text style={styles.h2}>3. User Accounts</Text>
          <Text style={styles.p}>Using our app requires you to create an account. By doing so, you agree to:</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>• Provide accurate and up-to-date information.</Text>
            <Text style={styles.li}>• Keep your login credentials secure.</Text>
            <Text style={styles.li}>• Notify us immediately of any unauthorized use of your account.</Text>
          </View>
          <Text style={styles.p}>You are responsible for all activity that occurs under your account.</Text>

          <Text style={styles.h2}>4. Acceptable Use</Text>
          <Text style={styles.p}>You agree to use Aftershock responsibly and lawfully. You may not:</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>• Upload or share false, misleading, or harmful information.</Text>
            <Text style={styles.li}>• Interfere with the operation of the App or its servers.</Text>
            <Text style={styles.li}>• Attempt to reverse-engineer, decompile, or tamper with the App.</Text>
            <Text style={styles.li}>• Collect or share other users’ data without their consent.</Text>
          </View>
          <Text style={styles.p}>We reserve the right to suspend or terminate access to anyone who violates these rules.</Text>

          <Text style={styles.h2}>5. Content</Text>
          <Text style={styles.p}><Text style={{ fontWeight: '700' }}>Your Content:</Text></Text>
          <Text style={styles.p}>
            You may create and store personal emergency plans, contacts, and other information (“User Content”). You retain ownership of this content. By using the App, you give us permission to store and display your User Content only as needed to operate and improve the Services.
          </Text>
          <Text style={styles.p}><Text style={{ fontWeight: '700' }}>Our Content:</Text></Text>
          <Text style={styles.p}>
            All other materials in the App—including text, design, graphics, lessons, and videos—are owned by us or our partners. You may not copy, modify, or redistribute them without permission.
          </Text>

          <Text style={styles.h2}>6. Privacy</Text>
          <Text style={styles.p}>
            Your privacy is important to us. Please read our Privacy Policy to understand how we collect, use, and protect your data. Aftershock may store your data locally on your device or securely in encrypted databases. We never share your personal or emergency information without your explicit consent.
          </Text>

          <Text style={styles.h2}>7. Disclaimers</Text>
          <Text style={styles.p}>
            Aftershock provides educational and planning tools for informational use only. We make no guarantees that the App or its content will:
          </Text>
          <View style={styles.ul}>
            <Text style={styles.li}>• Prevent injury, loss, or damage during an actual emergency.</Text>
            <Text style={styles.li}>• Remain uninterrupted or error-free.</Text>
            <Text style={styles.li}>• Always reflect current emergency best practices.</Text>
          </View>
          <Text style={styles.p}>Use Aftershock at your own discretion and always follow official local emergency instructions.</Text>

          <Text style={styles.h2}>8. Limitation of Liability</Text>
          <Text style={styles.p}>
            To the fullest extent allowed by law, we are not liable for any loss, damage, or injury resulting from:
          </Text>
          <View style={styles.ul}>
            <Text style={styles.li}>• Your reliance on the App’s content.</Text>
            <Text style={styles.li}>• Technical errors or data loss.</Text>
            <Text style={styles.li}>• Third-party links or integrations.</Text>
          </View>
          <Text style={styles.p}>You agree to use Aftershock at your own risk.</Text>

          <Text style={styles.h2}>9. Changes to the Terms</Text>
          <Text style={styles.p}>
            We may update these Terms from time to time. If significant changes occur, we will notify you within the App or on our website. Continued use of Aftershock means you accept the updated Terms.
          </Text>

          <Text style={styles.h2}>10. Termination</Text>
          <Text style={styles.p}>
            You may stop using Aftershock at any time. We may suspend or terminate access if you violate these Terms or misuse the Services.
          </Text>

          <Text style={styles.h2}>11. Contact</Text>
          <Text style={styles.p}>If you have questions or concerns about these Terms, please contact us at:</Text>
          <TouchableOpacity onPress={() => openLink('mailto:support@aftershockapp.com')}>
            <Text style={styles.link}>Email: support@aftershockapp.com</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.aftershockapp.com')}>
            <Text style={styles.link}>Website: www.aftershockapp.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },

  meta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 12,
  },

  h2: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 18,
    marginBottom: 6,
  },

  p: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  ul: {
    marginTop: 8,
    marginLeft: 12,
  },
  li: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },

  link: {
    color: colors.primary,
    marginTop: 8,
    fontWeight: '600',
    fontSize: 14,
  },

  note: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
    padding: 12,
    marginTop: 14,
    borderRadius: 8,
  },
  noteText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});

