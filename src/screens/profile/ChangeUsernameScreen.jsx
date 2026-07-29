import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FormField } from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { db } from '../../lib/firebaseConfig';
import { backendHash } from '../../lib/api';
import { getData, storeData } from '../../lib/storage/storageUtils';
export default function ChangeUsername() {
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const navigation = useNavigation();
  const handleSave = async () => {
    if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
      Alert.alert('Error', 'Please enter a username at least 3 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
      Alert.alert("Error", "Username must only contain letters, numbers, or underscores.");
      return;
    }
    const oldUsername = await getData('username');
    if (!oldUsername) {
      Alert.alert('Error', 'No current username found.');
      return;
    }
    const q = query(collection(db, 'user'), where('username', '==', newUsername));
    const res = await getDocs(q);
    if (!res.empty) {
      Alert.alert('Error', 'Username already taken. Choose another.');
      return;
    }
    const q2 = query(collection(db, 'user'), where('username', '==', oldUsername));
    const r2 = await getDocs(q2);
    if (r2.empty) {
      Alert.alert('Error', 'User record not found.');
      return;
    }
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
      await updateDoc(docRef, {
        username: newUsername
      });
      await storeData('username', newUsername);
      Alert.alert('Success', 'Username updated.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update username.');
    }
  };
  return <View className={"flex-1 bg-background p-[20px] justify-start"}>
      <Card>
        <Text className={"mb-[12px] text-secondary-foreground leading-[20px]"}>
          Choose a new username. It must be at least 3 characters and unique.
        </Text>
        <FormField label="New username">
          <Input placeholder="New username" value={newUsername} onChangeText={setNewUsername} autoCapitalize="none" autoCorrect={false} textContentType="username" />
        </FormField>
        <FormField label="Confirm password">
          <Input placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" />
        </FormField>
        <Button onPress={handleSave}>Save Username</Button>
      </Card>
    </View>;
}
