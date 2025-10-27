import { useNavigation } from "@react-navigation/native";
import { useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { colors } from "../css";
import { getData } from "../storage/storageUtils";

export default function Landing() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  useEffect(() => {
    let mounted = true;

    // check login and redirect if already signed in
    getData('isLoggedIn').then((val) => {
      if (!mounted) return;
      if (val === 'yes') navigation.replace('MainApp');
    }).catch(() => {});

    return () => { mounted = false; };
  }, []);

  const onPress = () => {
    navigation.replace("AccountCreation");
  };

  const imageSize = Math.min(300, Math.max(120, width * 0.5));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Aftershock</Text>
          <Text style={styles.tagline}>Earthquake Preparedness App</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/favicon.png')}
              style={[
                styles.logo,
                { 
                  width: imageSize, 
                  height: imageSize, 
                  borderRadius: Math.round(imageSize * 0.1) 
                }
              ]}
              resizeMode="cover"
            />
          </View>

          <View style={styles.featureList}>
            <Text style={styles.featureBullet}>• Emergency Planning</Text>
            <Text style={styles.featureBullet}>• Epicenter AI Assistance</Text>
            <Text style={styles.featureBullet}>• Contact Management</Text>
            <Text style={styles.featureBullet}>• Document Storage</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.missionText}>
            Your comprehensive earthquake preparedness companion
          </Text>
          
          <TouchableOpacity 
            onPress={onPress}
            style={styles.launchButton}
            activeOpacity={0.8}
          >
              <Text style={styles.launchText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>
              Already have an account? <Text style={styles.loginText}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.light 
  },
  container: { 
    flex: 1, 
    padding: 16,
    justifyContent: 'space-between' 
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featureList: {
    marginTop: 16,
    alignItems: 'center',
  },
  featureBullet: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  missionText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    fontWeight: '500',
  },
  launchButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    maxWidth: 260,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 14,
  },
  launchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    padding: 6,
  },
  secondaryText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  loginText: {
    color: colors.primary,
    fontWeight: '600',
  },
});