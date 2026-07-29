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
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const current = await getData('username');
        if (current) setUsernameInput(current);
      } catch (e) {
        console.error('Error loading username for deletion:', e);
      }
    })();
  }, []);
  const handleDelete = async () => {
    if (!usernameInput || !passwordInput) {
      Alert.alert('Error', 'Please enter both username and password to confirm.');
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'user'), where('username', '==', usernameInput));
      const res = await getDocs(q);
      if (res.empty) {
        Alert.alert('Error', 'No account found with that username.');
        setLoading(false);
        return;
      }
      const userDoc = res.docs[0];
      const data = userDoc.data();
      const hashed = await backendHash(passwordInput);
      if (!hashed || data.password_hash !== hashed) {
        Alert.alert('Error', 'Username or password is incorrect.');
        setLoading(false);
        return;
      }
      const logged = await getData('username');
      if (!logged || logged !== usernameInput) {
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
        <Button unstyled onPress={() => navigation?.goBack?.()} className={[["mb-[20px]"].filter(Boolean).join(" "), "mt-[20px] mb-[15px] self-start py-[8px] px-[12px] rounded-[12px] bg-card border border-border"].filter(Boolean).join(" ")}>
          <Text className={"text-primary font-bold"}>{"← Back"}</Text>
        </Button>
        <View className={"bg-card p-[18px] rounded-[14px] shadow-sm mb-[12px]"}>
          <Text className={["text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"].filter(Boolean).join(" ")}>Delete Account</Text>
          <Text className={"mb-[14px] text-secondary-foreground leading-[20px]"}>
            To permanently delete your account, please verify your password.
          </Text>

         <Text className={"text-foreground mb-[8px] font-semibold"}>Username</Text>
          <Input placeholder="Username" value={usernameInput} onChangeText={setUsernameInput} className={["border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground", "bg-muted text-muted-foreground"].filter(Boolean).join(" ")} autoCapitalize="none" editable={false} selectTextOnFocus={false} />
          <Text className={"text-foreground mb-[8px] font-semibold"}>Confirm Password</Text>
          <Input placeholder="Password" value={passwordInput} onChangeText={setPasswordInput} secureTextEntry className={"border border-border rounded-[12px] py-[13px] px-[14px] mb-[12px] bg-card text-foreground"} />
          <View className={"bg-warning/10 border-l-[4px] border-warning py-[10px] px-[12px] rounded-[8px] mb-[12px] mt-[6px]"}>
            <Text className={"font-bold text-warning mb-[4px]"}>Important</Text>
            <Text className={"text-warning leading-[18px] text-[13px]"}>
              Deleting your account will permanently remove all of your data — emergency contacts, plans, documents, and preferences. This action cannot be undone.
            </Text>
          </View>
          <Button unstyled onPress={handleDelete} className={["bg-primary rounded-[12px] mt-[8px] py-[14px] items-center justify-center", loading && "opacity-[0.6]"].filter(Boolean).join(" ")} disabled={loading}>
            <Text className={"text-primary-foreground font-bold"}>{loading ? 'Deleting...' : 'Delete Account'}</Text>
          </Button>
        </View>
      </ScrollView>
    </View>;
}

// Local styles for DeleteAccount
