import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../../css';
import { db } from '../../db/firebaseConfig';
import { backendHash } from '../../requests';
import { getData, storeData } from '../../storage/storageUtils';

export default function ChangeDetails() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const username = await getData('username');
      if (!username) return;
      const q = query(collection(db, 'user'), where('username', '==', username));
      const res = await getDocs(q);
      if (res.empty) return;
      const data = res.docs[0].data();
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setZipcode(data.zip_code || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
    })();
  }, []);

  const handleSave = async () => {
    if (!currentPassword || currentPassword.length === 0) {
      Alert.alert('Error', 'Enter your current password to confirm.');
      return;
    }

    setLoading(true);
    try {
      const username = await getData('username');
      if (!username) {
        Alert.alert('Error', 'No username found.');
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'user'), where('username', '==', username));
      const res = await getDocs(q);
      if (res.empty) {
        Alert.alert('Error', 'User not found.');
        setLoading(false);
        return;
      }

      const docRef = res.docs[0].ref;
      const userData = res.docs[0].data();

      // verify password
      const ch = await backendHash(currentPassword);
      if (!ch || userData.password_hash !== ch) {
        Alert.alert('Error', 'Current password is incorrect.');
        setLoading(false);
        return;
      }

      // update firestore
      await updateDoc(docRef, {
        first_name: firstName,
        last_name: lastName,
        zip_code: zipcode,
        phone: phone,
        email: email,
      });

      // update AsyncStorage copies
      await storeData('firstname', firstName);
      await storeData('postalcode', zipcode);

      Alert.alert('Success', 'Details updated.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.heading}>Change Details</Text>
      <TextInput placeholder="First name" value={firstName} onChangeText={setFirstName} style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginBottom:8 }} />
      <TextInput placeholder="Last name" value={lastName} onChangeText={setLastName} style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginBottom:8 }} />
      <TextInput placeholder="Zip code" value={zipcode} onChangeText={setZipcode} style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginBottom:8 }} keyboardType="number-pad" />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginBottom:8 }} keyboardType="phone-pad" />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginBottom:8 }} keyboardType="email-address" autoCapitalize="none" />

      <TextInput placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginBottom:12 }} />

      <TouchableOpacity onPress={handleSave} style={{ backgroundColor:'#519872', borderRadius:8, padding:12 }} disabled={loading}>
        <Text style={{ color:'#fff', textAlign:'center' }}>{loading ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
}
