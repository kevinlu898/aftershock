import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../../css';
import { db } from '../../db/firebaseConfig';
import { getData, storeData } from '../../storage/storageUtils';

export default function ChangeUsername() {
  const [newUsername, setNewUsername] = useState('');
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!newUsername || newUsername.length < 3) {
      Alert.alert('Error', 'Please enter a username at least 3 characters long.');
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
    <View style={globalStyles.container}>
      <Text style={globalStyles.heading}>Change Username</Text>
      <TextInput
        placeholder="New username"
        value={newUsername}
        onChangeText={setNewUsername}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
      />
      <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#519872', borderRadius: 8, padding: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}
