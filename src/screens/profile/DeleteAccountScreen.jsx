import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../lib/firebaseConfig';
import { backendHash } from '../../lib/api';
import { getData } from '../../lib/storage/storageUtils';
export default function DeleteAccount() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const clearAll = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
  };
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const current = await getData('email');
        if (current) setEmailInput(current);
      } catch (e) {
        console.error('Error loading username for deletion:', e);
      }
    })();
  }, []);
  const handleDelete = async () => {
    if (!emailInput || !passwordInput) {
      Alert.alert('Error', 'Enter your email and password to confirm.');
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'user'), where('email', '==', emailInput.trim().toLowerCase()));
      const res = await getDocs(q);
      if (res.empty) {
        Alert.alert('Error', 'No account found with that email.');
        setLoading(false);
        return;
      }
      const userDoc = res.docs[0];
      const data = userDoc.data();
      const hashed = await backendHash(passwordInput);
      if (!hashed || data.password_hash !== hashed) {
        Alert.alert('Error', 'Email or password is incorrect.');
        setLoading(false);
        return;
      }
      const logged = await getData('username');
      if (!logged || logged !== (data.username || data.email)) {
        Alert.alert('Error', 'You can only delete the account you are currently signed in with.');
        setLoading(false);
        return;
      }
      Alert.alert('Confirm Delete', 'This will permanently delete your account and all associated data. This cannot be undone.', [{
        text: 'Cancel',
        style: 'cancel',
        onPress: () => setLoading(false)
      }, {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(userDoc.ref);
            await clearAll();
            try {
              await signOut(auth);
            } catch (_error) {
              // ignore
            }
            Alert.alert('Deleted', 'Your account has been deleted.');
            navigation.replace('Login');
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to delete account.');
            setLoading(false);
          }
        }
      }], {
        cancelable: true
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An unexpected error occurred.');
      setLoading(false);
    }
  };
  return <View className="flex-1 bg-background">
      
      <ScrollView contentContainerStyle={{
      padding: 18,
      paddingBottom: (insets?.bottom || 16) + 24
    }} keyboardShouldPersistTaps="handled">
        <View className={"bg-card p-[18px] rounded-[14px] shadow-sm mb-[12px]"}>
          <Text className={"mb-[14px] text-secondary-foreground leading-[20px]"}>
            To permanently delete your account, please verify your password.
          </Text>

         <Text className={"text-foreground mb-[8px] font-semibold"}>Email</Text>
          <Input placeholder="Email" value={emailInput} onChangeText={setEmailInput} className={["border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground", "bg-muted text-muted-foreground"].filter(Boolean).join(" ")} autoCapitalize="none" editable={false} selectTextOnFocus={false} />
          <Text className={"text-foreground mb-[8px] font-semibold"}>Confirm Password</Text>
          <Input placeholder="Password" value={passwordInput} onChangeText={setPasswordInput} secureTextEntry className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} />
          <View className={"bg-warning/10 border-l-[4px] border-warning py-[10px] px-[12px] rounded-[8px] mb-[12px] mt-[6px]"}>
            <Text className={"font-bold text-warning mb-[4px]"}>Important</Text>
            <Text className={"text-warning leading-[18px] text-[13px]"}>
              Deleting your account will permanently remove all of your data, including emergency contacts, plans, documents, and preferences. This action cannot be undone.
            </Text>
          </View>
          <Button variant="destructive" onPress={handleDelete} loading={loading}>
            Delete Account
          </Button>
        </View>
      </ScrollView>
    </View>;
}

// Local styles for DeleteAccount
