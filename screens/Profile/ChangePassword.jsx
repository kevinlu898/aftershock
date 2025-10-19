import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../../css';
import { db } from '../../db/firebaseConfig';
import { backendHash } from '../../requests';
import { getData } from '../../storage/storageUtils';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
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
    <View style={globalStyles.container}>
      <Text style={globalStyles.heading}>Change Password</Text>
      <TextInput
        placeholder="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
      />
      <TextInput
        placeholder="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
      />
      <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#519872', borderRadius: 8, padding: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}
