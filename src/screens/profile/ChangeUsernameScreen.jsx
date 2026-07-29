import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
  return <View className={"flex-1 bg-background p-[18px] pt-[24px] justify-start"}>
      <Button unstyled onPress={() => navigation?.goBack?.()} className={"mt-[20px] mb-[15px] self-start py-[8px] px-[12px] rounded-[12px] bg-card border border-border"}>
        <Text className={"text-primary font-bold"}>{"← Back"}</Text>
      </Button>
      <View className={"bg-card p-[18px] rounded-[14px] shadow-sm mb-[12px]"}>
        <Text className="text-center text-3xl font-extrabold text-primary">Change Username</Text>
        <Text className={"mb-[12px] text-secondary-foreground leading-[20px]"}>
          Choose a new username. It must be at least 3 characters and unique.
        </Text>
        <Text className={"text-foreground mb-[8px] font-semibold"}>New Username</Text>
        <Input placeholder="New username" value={newUsername} onChangeText={setNewUsername} className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} autoCapitalize="none" autoCorrect={false} textContentType="username" />
        <Text className={"text-foreground mb-[8px] font-semibold"}>Confirm Password</Text>
        <Input placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} autoCapitalize="none" autoCorrect={false} textContentType="password" />
        <Button unstyled onPress={handleSave} className={["bg-primary rounded-[12px] mt-[8px] py-[14px] items-center justify-center"].filter(Boolean).join(" ")}>
          <Text className={"text-primary-foreground font-bold"}>Save</Text>
        </Button>
      </View>
    </View>;
}
