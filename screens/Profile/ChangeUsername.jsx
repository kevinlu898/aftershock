import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, globalStyles } from '../../css';
import { db } from '../../db/firebaseConfig';
import { getData, storeData } from '../../storage/storageUtils';

export default function ChangeUsername() {
  const [newUsername, setNewUsername] = useState('');
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
      <View style={styles.card}>
        <Text style={[globalStyles.heading, styles.heading]}>Change Username</Text>
        <Text style={styles.infoText}>
          Choose a new username. It must be at least 3 characters and unique.
        </Text>

        <TextInput
          placeholder="New username"
          value={newUsername}
          onChangeText={setNewUsername}
          style={styles.input}
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
  heading: { marginBottom: 8},
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
