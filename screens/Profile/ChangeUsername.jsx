import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, globalStyles } from '../../css';
import { db } from '../../db/firebaseConfig';
import { backendHash } from '../../requests';
import { getData, storeData } from '../../storage/storageUtils';

export default function ChangeUsername() {
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!newUsername || newUsername.length < 3|| newUsername.length > 20) {
      Alert.alert('Error', 'Please enter a username at least 3 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
      Alert.alert(
        "Error",
        "Username must only contain letters, numbers, or underscores."
      );
      return;
    }

    const oldUsername = await getData('username');
    if (!oldUsername) {
      Alert.alert('Error', 'No current username found.');
      return;
    }

    // Check if new username already exists
    const q = query(collection(db, 'user'), where('username', '==', newUsername));
    const res = await getDocs(q);
    if (!res.empty) {
      Alert.alert('Error', 'Username already taken. Choose another.');
      return;
    }

    // Find current user doc
    const q2 = query(collection(db, 'user'), where('username', '==', oldUsername));
    const r2 = await getDocs(q2);
    if (r2.empty) {
      Alert.alert('Error', 'User record not found.');
      return;
    }

    // Verify current password before allowing username change
    if (!currentPassword || currentPassword.length === 0) {
      Alert.alert('Error', 'Please enter your current password to confirm.');
      return;
    }
    const currentHash = await backendHash(currentPassword);
    const userData = r2.docs[0].data();
    if (!currentHash || userData.password_hash !== currentHash) {
      Alert.alert('Error', 'Current password is incorrect.');
      return;
    }

    try {
      const docRef = r2.docs[0].ref;
      await updateDoc(docRef, { username: newUsername });
      await storeData('username', newUsername);
      Alert.alert('Success', 'Username updated.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update username.');
    }
  };

  return (
    <View style={styles.page}>
      <TouchableOpacity onPress={() => navigation?.goBack?.()} style={globalStyles.backButton}>
        <Text style={globalStyles.backButtonText}>{"← Back"}</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <Text style={[globalStyles.heading, styles.heading]}>Change Username</Text>
        <Text style={styles.infoText}>
          Choose a new username. It must be at least 3 characters and unique.
        </Text>
        <Text style={globalStyles.inputLabel}>New Username</Text>
        <TextInput
          placeholder="New username"
          value={newUsername}
          onChangeText={setNewUsername}
          style={globalStyles.input}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
        />
        <Text style={globalStyles.inputLabel}>Confirm Password</Text>
        <TextInput
          placeholder="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          style={globalStyles.input}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
        />
        <TouchableOpacity onPress={handleSave} style={[globalStyles.button]}>
          <Text style={globalStyles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  heading: { marginBottom: 8},
  infoText: { marginBottom: 12, color: colors.secondary, lineHeight: 20 },
});
