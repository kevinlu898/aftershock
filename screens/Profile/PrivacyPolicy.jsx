import { useNavigation } from '@react-navigation/native';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, globalStyles } from '../../css';

export default function PrivacyPolicy() {
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
          <Text style={globalStyles.heading}>Privacy Policy</Text>
          <Text style={styles.meta}>Last updated: October 20, 2025</Text>

          <Text style={styles.p}>
            Aftershock is an earthquake preparedness app, and your privacy matters to us. 
            This Privacy Policy explains what information we collect, how we use it, and what rights you have.
          </Text>

          <Text style={styles.h2}>1. Information We Collect</Text>
          <Text style={styles.p}>
            We collect information only to make Aftershock work properly and keep your data secure.
          </Text>

          <Text style={[styles.p, { fontWeight: '700', marginTop: 12 }]}>1.1 Information You Provide</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>• Account details (like your name, email, or password)</Text>
            <Text style={styles.li}>• Emergency plans and contact info you save within the app</Text>
            <Text style={styles.li}>• Uploaded documents (like identification, insurance forms, or checklists)</Text>
            <Text style={styles.li}>• AI chat messages or inputs used for preparedness advice</Text>
          </View>
          <Text style={styles.p}>All of this data stays private to your account and is never sold or publicly shared.</Text>

          <Text style={[styles.p, { fontWeight: '700', marginTop: 12 }]}>1.2 Automatically Collected Information</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>• App version and usage analytics (for debugging and updates)</Text>
            <Text style={styles.li}>• Device type and operating system</Text>
            <Text style={styles.li}>• Crash reports or error logs</Text>
          </View>
          <Text style={styles.p}>
            We do not track your exact location unless you enable location-based features (like regional earthquake alerts).
          </Text>

          <Text style={styles.h2}>2. How We Use Your Information</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>• Provide and personalize app features</Text>
            <Text style={styles.li}>• Help you save and organize emergency plans</Text>
            <Text style={styles.li}>• Respond to feedback or support requests</Text>
            <Text style={styles.li}>• Improve app performance and reliability</Text>
            <Text style={styles.li}>• Securely store encrypted documents and data</Text>
          </View>
          <Text style={styles.p}>We never use your data for advertising or marketing without consent.</Text>

          <Text style={styles.h2}>3. Data Storage and Security</Text>
          <Text style={styles.p}>
            Your privacy and safety are our top priorities. All sensitive data is encrypted before storage and when transmitted.
            If cloud backups are enabled, they are also encrypted at rest. We use strong security practices to prevent unauthorized access.
            You can delete your account or data anytime in settings.
          </Text>

          <Text style={styles.h2}>4. AI and Data Handling</Text>
          <Text style={styles.p}>
            Aftershock may use AI features to generate preparedness suggestions or summarize your plans.
            AI responses are generated from your inputs and context, but your personal data is never used to train external models.
            Temporary data is processed securely and deleted after use.
          </Text>

          <Text style={styles.h2}>5. Sharing Your Information</Text>
          <Text style={styles.p}>
            We do not sell, rent, or trade your personal data. We may share limited information only to:
          </Text>
          <View style={styles.ul}>
            <Text style={styles.li}>• Comply with legal obligations</Text>
            <Text style={styles.li}>• Provide secure cloud or AI services</Text>
            <Text style={styles.li}>• Protect user safety and prevent misuse</Text>
          </View>
          <Text style={styles.p}>
            All third parties must follow strict privacy and data protection standards.
          </Text>

          <Text style={styles.h2}>6. Your Rights</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>• Access or export your saved data</Text>
            <Text style={styles.li}>• Edit or delete your personal information</Text>
            <Text style={styles.li}>• Request permanent data deletion</Text>
            <Text style={styles.li}>• Disable analytics or AI features in settings</Text>
          </View>
          <Text style={styles.p}>
            To exercise these rights, do so within the app or contact us at privacy@aftershockapp.com.
          </Text>

          <Text style={styles.h2}>7. Children’s Privacy</Text>
          <Text style={styles.p}>
            Aftershock is intended for users aged 13 and older. We do not knowingly collect data from children under 13. 
            If we learn a child has provided information, we delete it immediately.
          </Text>

          <Text style={styles.h2}>8. Changes to This Policy</Text>
          <Text style={styles.p}>
            We may update this Privacy Policy occasionally. When we do, we’ll post the new version here and update the “Last Updated” date.
          </Text>

          <Text style={styles.h2}>9. Contact Us</Text>
          <Text style={styles.p}>If you have any questions or concerns about privacy, contact us:</Text>
          <TouchableOpacity onPress={() => openLink('mailto:privacy@aftershockapp.com')}>
            <Text style={styles.link}>Email: privacy@aftershockapp.com</Text>
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
