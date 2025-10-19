import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { globalStyles } from '../css';

export default function UserAgreement() {
  const navigation = useNavigation();

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.heading}>User Agreement</Text>
      <Text style={{ marginTop: 12 }}>xyz place holder</Text>
    </View>
  );
}
