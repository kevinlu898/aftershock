

import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { Alert, Button, Platform, Text, View } from 'react-native';
import { globalStyles } from '../../css';
import { auth } from '../../db/firebaseConfig';
import { storeData } from '../../storage/storageUtils';


export default function Profile() {
  const navigation = useNavigation();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (confirmed) {
        signOut(auth)
          .then(async () => {
            await storeData('isLoggedIn', 'no');
            await storeData('username', '');
            navigation.replace('Login');
          })
          .catch(() => {
            window.alert('Failed to log out.');
          });
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              try {
                await signOut(auth);
                await storeData('isLoggedIn', 'no');
                await storeData('username', '');
                navigation.replace('Login');
              } catch (e) {
                Alert.alert('Error', 'Failed to log out.');
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={globalStyles.heading}>Profile</Text>

      <Text>Your Progress</Text>
      <Text>What's Next</Text>
      <Text>Welcome, Friend</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}
