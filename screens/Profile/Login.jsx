import { useNavigation } from '@react-navigation/native';
import { and, collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSizes, globalStyles } from '../../css';
import { db } from '../../db/firebaseConfig';

const styles = {
  input: {
    height: 50,
    borderColor: colors.secondary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: fontSizes.medium,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  heading: {
    fontSize: fontSizes.xlarge,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: fontSizes.medium,
    color: colors.accent,
    textAlign: 'left',
    marginBottom: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSizes.large,
    textAlign: 'center',
    fontWeight: 'bold',
  },
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleVerify = async () => {
    const userTable = collection(db, 'user');

    const queryToCheck = query(
      userTable,
      and(where('username', '==', username), where('password', '==', password))
    );

    const results = await getDocs(queryToCheck);
    if (!results.empty) {
      console.log('exists!');
      Alert.alert('Success', 'You are logged in!');
      navigation.navigate('MainApp');
    } else {
      console.log("acc doesn't");
      Alert.alert(
        'Error',
        "Either your username or password is wrong. Try creating a new account..."
      );
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.heading}>{"\n"}Welcome Back to Aftershock!{"\n"}{' '}</Text>
        <Image
          source={require('../../assets/images/favicon.png')}
          style={{ width: 100, height: 100, borderRadius: 20, marginBottom: 20 }}
        />
      </View>

      <Text style={[globalStyles.text, styles.inputLabel]}>Username:</Text>
      <TextInput style={styles.input} placeholder="Enter Username" value={username} onChangeText={setUsername} />

      <Text style={[globalStyles.text, styles.inputLabel]}>Password:</Text>
      <TextInput style={styles.input} placeholder="Enter Password" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('AccountCreation')}>
        <Text style={{ color: colors.primary, textAlign: 'center', marginTop: 16 }}>
          I dont have an account
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}