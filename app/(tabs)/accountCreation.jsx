import Checkbox from 'expo-checkbox'; // works directly with Expo
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, globalStyles } from '../css';

export default function AccountFlow() {
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

  const handleNext = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setStep(2);
  };

  const handleCreateAccount = () => {
    if (!firstName || !lastName || !zipCode || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!termsAgree) {
      Alert.alert('Error', 'You must agree to the Terms & Privacy Policy');
      return;
    }
    Alert.alert('Success', `Welcome ${username}! Account created.`);
  };

  return (
    <ScrollView style={globalStyles.container}>
      {step === 1 ? (
        <>
          <Text style={globalStyles.heading}>Create New Account</Text>

          <Text style={[globalStyles.text, styles.inputLabel]}>Username:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Username"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Confirm Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={globalStyles.heading}>Enter Your Details</Text>

          <Text style={[globalStyles.text, styles.inputLabel]}>First Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Last Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Zip Code:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Zip Code"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
          />

          <Text style={[globalStyles.text, styles.inputLabel]}>Phone Number:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          {/* Terms Agreement */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={termsAgree}
              onValueChange={setTermsAgree}
              color={termsAgree ? colors.primary : undefined} // optional styling
            />
            <Text style={styles.checkboxLabel}>
              I agree to the Terms & Privacy Policy
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
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
};