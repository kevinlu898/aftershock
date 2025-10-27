import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, globalStyles } from '../../css';
import { auth, db } from '../../db/firebaseConfig';
import { backendHash } from '../../requests';
import { getData } from '../../storage/storageUtils';

export default function DeleteAccount() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const clearAll = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
  };
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const current = await getData('username');
        if (current) setUsernameInput(current);
      } catch (e) {
        console.error('Error loading username for deletion:', e);
      }
    })();
  }, []);

  const handleDelete = async () => {
    if (!usernameInput || !passwordInput) {
      Alert.alert('Error', 'Please enter both username and password to confirm.');
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'user'), where('username', '==', usernameInput));
      const res = await getDocs(q);
      if (res.empty) {
        Alert.alert('Error', 'No account found with that username.');
        setLoading(false);
        return;
      }

      const userDoc = res.docs[0];
      const data = userDoc.data();

      const hashed = await backendHash(passwordInput);
      if (!hashed || data.password_hash !== hashed) {
        Alert.alert('Error', 'Username or password is incorrect.');
        setLoading(false);
        return;
      }

      const logged = await getData('username');
      if (!logged || logged !== usernameInput) {
        Alert.alert('Error', 'You can only delete the account you are currently signed in with.');
        setLoading(false);
        return;
      }

      Alert.alert(
        'Confirm Delete',
        'This will permanently delete your account and all associated data. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteDoc(userDoc.ref);
                await clearAll();
                try {
                  await signOut(auth);
                } catch (e) {
                  // ignore
                }
                Alert.alert('Deleted', 'Your account has been deleted.');
                navigation.replace('Login');
              } catch (err) {
                console.error(err);
                Alert.alert('Error', 'Failed to delete account.');
                setLoading(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.light }}>
      <StatusBar backgroundColor={colors.light} barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: (insets?.bottom || 16) + 24 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={[globalStyles.backButton, { marginBottom: 20 }]}>
          <Text style={globalStyles.backButtonText}>{"← Back"}</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <Text style={[globalStyles.heading]}>Delete Account</Text>
          <Text style={styles.infoText}>
            To permanently delete your account, please verify your password.
          </Text>

         <Text style={globalStyles.inputLabel}>Username</Text>
          <TextInput
            placeholder="Username"
            value={usernameInput}
            onChangeText={setUsernameInput}
            style={[globalStyles.input, globalStyles.disabledInput]}
            autoCapitalize="none"
            editable={false}
            selectTextOnFocus={false}
          />
          <Text style={globalStyles.inputLabel}>Confirm Password</Text>
          <TextInput
            placeholder="Password"
            value={passwordInput}
            onChangeText={setPasswordInput}
            secureTextEntry
            style={globalStyles.input}
          />
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Important</Text>
            <Text style={styles.infoBoxText}>
              Deleting your account will permanently remove all of your data — emergency contacts, plans, documents, and preferences. This action cannot be undone.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleDelete}
            style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
            disabled={loading}
          >
            <Text style={globalStyles.buttonText}>{loading ? 'Deleting...' : 'Delete Account'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Local styles for DeleteAccount
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 18,
    paddingTop: 24,
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 6,
  },
  infoBoxTitle: {
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  infoBoxText: {
    color: '#92400E',
    lineHeight: 18,
    fontSize: 13,
  },
  infoText: {
    marginBottom: 14,
    color: colors.secondary,
    lineHeight: 20,
  }
});
