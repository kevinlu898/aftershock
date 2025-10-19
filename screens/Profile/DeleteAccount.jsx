import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, globalStyles } from '../../css';
import { auth, db } from '../../db/firebaseConfig';
import { backendHash } from '../../requests';
import { clearData, getData } from '../../storage/storageUtils';

export default function DeleteAccount() {
  const navigation = useNavigation();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load the currently logged-in username and lock the field so users can only delete their own account
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
      // Find user document by username
      const q = query(collection(db, 'user'), where('username', '==', usernameInput));
      const res = await getDocs(q);
      if (res.empty) {
        Alert.alert('Error', 'No account found with that username.');
        setLoading(false);
        return;
      }

      const userDoc = res.docs[0];
      const data = userDoc.data();

      // Verify password by hashing and comparing to stored password_hash
      const hashed = await backendHash(passwordInput);
      if (!hashed || data.password_hash !== hashed) {
        Alert.alert('Error', 'Username or password is incorrect.');
        setLoading(false);
        return;
      }

      // Make sure the username being deleted matches the logged-in username
      const logged = await getData('username');
      if (!logged || logged !== usernameInput) {
        Alert.alert('Error', 'You can only delete the account you are currently signed in with.');
        setLoading(false);
        return;
      }

      // Confirm final destructive action
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
                // Delete Firestore user document
                await deleteDoc(userDoc.ref);

                // Clear AsyncStorage keys related to user
                await clearData('isLoggedIn');
                await clearData('username');
                await clearData('emergencyContacts');
                await clearData('riskdata');
                await clearData('firstname');
                await clearData('postalcode');

                // Sign out from Firebase Auth if signed in
                try {
                  await signOut(auth);
                } catch (e) {
                  // ignore signOut errors
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
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={[globalStyles.heading, styles.heading]}>Delete Account</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Important</Text>
          <Text style={styles.infoBoxText}>
            Deleting your account will permanently remove all of your data — emergency contacts, plans, documents, and preferences. This action cannot be undone.
          </Text>
        </View>
        <Text style={styles.infoText}>
          To permanently delete your account, please verify your password.
        </Text>

        {/* Show the logged-in username but prevent editing so users can't delete other accounts */}
        <TextInput
          placeholder="Username"
          value={usernameInput}
          onChangeText={setUsernameInput}
          style={[styles.input, styles.disabledInput]}
          autoCapitalize="none"
          editable={false}
          selectTextOnFocus={false}
        />

        <TextInput
          placeholder="Password"
          value={passwordInput}
          onChangeText={setPasswordInput}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleDelete}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Deleting...' : 'Delete Account'}</Text>
        </TouchableOpacity>
      </View>
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
  heading: {
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 14,
    color: colors.secondary,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6EEF3',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
    color: '#111827',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
