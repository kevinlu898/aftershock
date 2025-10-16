import { useNavigation } from "@react-navigation/native";
import { useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { colors, globalStyles } from "../css";
import { getData } from "../storage/storageUtils";

export default function Landing() {
  const navigation = useNavigation();
  // check login on mount
  useEffect(() => {
    let mounted = true;
    getData('isLoggedIn').then((val) => {
      if (!mounted) return;
      if (val === 'yes') navigation.replace('MainApp');
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const onPress = () => {
    navigation.replace("AccountCreation");
  };

  const { width } = useWindowDimensions();
  const imageSize = Math.min(320, Math.max(200, width * 0.5));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={globalStyles.heading}>Aftershock</Text>

        <View style={styles.brandWrap}>
          <Image
            source={require('../assets/images/favicon.png')}
            style={[styles.logo, { width: imageSize, height: imageSize, borderRadius: Math.round(imageSize * 0.12) } ]}
            resizeMode="cover"
          />

          <Text style={globalStyles.subheading}>Earthquake Planner App</Text>
          <Text style={globalStyles.text}>Preparedness made simple</Text>
        </View>

        <TouchableOpacity onPress={onPress} style={styles.launchButton} activeOpacity={0.85}>
          <Text style={styles.launchText}>Launch</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.light },
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  brandWrap: { alignItems: 'center', marginTop: 12 },
  logo: { marginBottom: 12 },
  launchButton: { marginTop: 22, backgroundColor: colors.secondary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, elevation: 3 },
  launchText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
