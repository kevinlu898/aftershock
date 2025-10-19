import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../../css';
import { auth, db } from '../../db/firebaseConfig';
import { backendHash } from '../../requests';
import { storeData } from '../../storage/storageUtils';

export default function DeleteAccount() {
  const navigation = useNavigation();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);

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
                await storeData('isLoggedIn', 'no');
                await storeData('username', '');
                await storeData('emergencyContacts', JSON.stringify([]));

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
    <View style={globalStyles.container}>
      <Text style={globalStyles.heading}>Delete Account</Text>
      <Text style={{ marginBottom: 8, color: '#666' }}>
        To permanently delete your account, enter your username and password below.
      </Text>

      <TextInput
        placeholder="Username"
        value={usernameInput}
        onChangeText={setUsernameInput}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={passwordInput}
        onChangeText={setPasswordInput}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
      />

      <TouchableOpacity
        onPress={handleDelete}
        style={{ backgroundColor: '#dc2626', borderRadius: 8, padding: 12 }}
        disabled={loading}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>{loading ? 'Deleting...' : 'Delete Account'}</Text>
      </TouchableOpacity>
    </View>
  );
}
