import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { globalStyles } from '../../css';

export default function PrivacyPolicy() {
  const navigation = useNavigation();

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.heading}>Privacy Policy</Text>
      <Text style={{ marginTop: 12 }}>xyz place holder</Text>
    </View>
  );
}
