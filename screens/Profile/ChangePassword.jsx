import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, globalStyles } from '../../css';
import { db } from '../../db/firebaseConfig';
import { backendHash } from '../../requests';
import { getData } from '../../storage/storageUtils';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigation = useNavigation();

  const handleSave = async () => {
    // Verify current password before allowing change
    if (!currentPassword || currentPassword.length === 0) {
      Alert.alert('Error', 'Enter your current password to confirm.');
      return;
    }
    if (newPassword.length < 8) {
        Alert.alert("Error", "Password must be at least 8 characters long");
        return;
      }
      if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
        Alert.alert(
          "Error",
          "Password must contain a mix of uppercase and lowercase letters"
        );
        return;
      }

    const username = await getData('username');
    if (!username) {
      Alert.alert('Error', 'No username found.');
      return;
    }

    const userTable = collection(db, 'user');
    const q = query(userTable, where('username', '==', username));
    const results = await getDocs(q);
    if (results.empty) {
      Alert.alert('Error', 'User record not found.');
      return;
    }

    // Verify current password before allowing username change
    if (!currentPassword || currentPassword.length === 0) {
      Alert.alert('Error', 'Please enter your current password to confirm.');
      return;
    }
    const currentHash = await backendHash(currentPassword);
    if (!currentHash || userData.password_hash !== currentHash) {
      Alert.alert('Error', 'Current password is incorrect.');
      return;
    }

    try {
      const docRef = results.docs[0].ref;
      const hashed = await backendHash(newPassword);
      await updateDoc(docRef, { password_hash: hashed });
      Alert.alert('Success', 'Password updated.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update password.');
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={[globalStyles.heading, styles.heading]}>Change Password</Text>
        <Text style={styles.infoText}>Update your account password. Make sure it's at least 8 characters long.</Text>

        <TextInput
          placeholder="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
        />
        <TextInput
          placeholder="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
        />
        <TouchableOpacity onPress={handleSave} style={[styles.button, false && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>Save</Text>
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
  heading: { marginBottom: 8 },
  infoText: { marginBottom: 12, color: colors.secondary, lineHeight: 20 },
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
  button: {
    backgroundColor: '#519872',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
