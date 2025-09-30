import { useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import { addDoc, collection } from 'firebase/firestore';
import { useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSizes, globalStyles } from '../../css';
import { db } from '../../db/firebaseConfig';
import { backendHash } from '../../requests';

export default function AccountFlow() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2 state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAgree, setTermsAgree] = useState(false);

  // Refs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const lastNameRef = useRef(null);
  const zipRef = useRef(null);
  const phoneRef = useRef(null);

  const addUser = async () => {
    try {
      const thehash = await backendHash(password);
      const docRef = await addDoc(collection(db, 'user'), {
        username,
        email,
        password_hash: thehash,
        first_name: firstName,
        last_name: lastName,
        zip_code: zipCode,
        phone_number: phoneNumber,
      });
      console.log('Document written with ID:', docRef.id);
    } catch (e) {
      console.error('Error adding document:', e);
    }
  };

  const handleNext = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      Alert.alert('Error', 'Username must be 3-20 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      Alert.alert('Error', 'Username must only contain letters, numbers, or underscores.');
      return;
    }

    if (!email.includes('@') || !email.includes('.') || email.length < 5) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== 'admin') {
      if (password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters long');
        return;
      }
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
        Alert.alert('Error', 'Password must contain a mix of uppercase and lowercase letters');
        return;
      }
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setStep(2);
  };

  const handleCreateAccount = async () => {
    if (!firstName || !lastName || !zipCode || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!/^\d{5}$/.test(zipCode)) {
      Alert.alert('Error', 'Please enter a valid 5-digit zip code');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!termsAgree) {
      Alert.alert('Error', 'You must agree to the Terms & Privacy Policy');
      return;
    }

    await addUser();

    Alert.alert('Success', `Welcome ${username}! Account created.`);
    navigation.navigate("MainApp");
  };

  const handleNavigateToLogin = () => {
    console.log('Navigating to Login...');
    navigation.navigate('Login'); // Changed from replace to navigate
  };

  return (
    <ScrollView style={globalStyles.container} keyboardShouldPersistTaps="handled">
      {step === 1 ? (
        <>
          <Text style={globalStyles.heading}>Create New Account</Text>

          <Text style={[globalStyles.text, styles.inputLabel]}>Username:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Username"
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Email:</Text>
          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Password:</Text>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Confirm Password:</Text>
          <TextInput
            ref={confirmPasswordRef}
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToLogin}>
            <Text style={{ color: colors.primary, textAlign: 'center', marginTop: 16 }}>
              I already have an account
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View>
          <Text style={globalStyles.heading}>Enter Your Details</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[globalStyles.text, styles.inputLabel]}>First Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter First Name"
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[globalStyles.text, styles.inputLabel]}>Last Name:</Text>
              <TextInput
                ref={lastNameRef}
                style={styles.input}
                placeholder="Enter Last Name"
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => zipRef.current?.focus()}
              />
            </View>
          </View>

          <Text style={[globalStyles.text, styles.inputLabel]}>Zip Code:</Text>
          <TextInput
            ref={zipRef}
            style={styles.input}
            placeholder="Enter Zip Code"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => phoneRef.current?.focus()}
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Phone Number:</Text>
          <TextInput
            ref={phoneRef}
            style={styles.input}
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleCreateAccount}
          />

          <View style={styles.checkboxContainer}>
            <Checkbox
              value={termsAgree}
              onValueChange={setTermsAgree}
              color={termsAgree ? colors.primary : undefined}
            />
            <Text style={styles.checkboxLabel}>
              I agree to the Terms & Privacy Policy
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: fontSizes.medium,
    color: colors.accent,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
};