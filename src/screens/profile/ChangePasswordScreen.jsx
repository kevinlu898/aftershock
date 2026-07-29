import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { db } from '../../lib/firebaseConfig';
import { backendHash } from '../../lib/api';
import { getData } from '../../lib/storage/storageUtils';
export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigation = useNavigation();
  const handleSave = async () => {
    if (!currentPassword || currentPassword.length === 0) {
      Alert.alert('Error', 'Enter your current password to confirm.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      Alert.alert("Error", "Password must contain a mix of uppercase and lowercase letters");
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
    const userData = results.docs[0].data();
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
      await updateDoc(docRef, {
        password_hash: hashed
      });
      Alert.alert('Success', 'Password updated.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update password.');
    }
  };
  return <View className={"flex-1 bg-background p-[18px] pt-[24px] justify-start"}>
      <Button unstyled onPress={() => navigation?.goBack?.()} className={"mt-[20px] mb-[15px] self-start py-[8px] px-[12px] rounded-[12px] bg-card border border-border"}>
        <Text className={"text-primary font-bold"}>{"← Back"}</Text>
      </Button>
      <View className={"bg-card p-[18px] rounded-[14px] shadow-sm mb-[12px]"}>
        <Text className={["text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"].filter(Boolean).join(" ")}>Change Password</Text>
        <Text className={"mb-[12px] text-secondary-foreground leading-[20px]"}>Update your account password. Make sure it is at least 8 characters long.</Text>
        <Text className={"text-foreground mb-[8px] font-semibold"}>Current Password</Text>
        <Input placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} autoCapitalize="none" autoCorrect={false} textContentType="password" />
        <Text className={"text-foreground mb-[8px] font-semibold"}>New Password</Text>
        <Input placeholder="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} autoCapitalize="none" autoCorrect={false} textContentType="newPassword" />
        <Button unstyled onPress={handleSave} className={["bg-primary rounded-[12px] mt-[8px] py-[14px] items-center justify-center", false && "opacity-[0.6]"].filter(Boolean).join(" ")}>
          <Text className={"text-primary-foreground font-bold"}>Save</Text>
        </Button>
      </View>
    </View>;
}
