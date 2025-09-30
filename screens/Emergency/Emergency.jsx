import { Button, Text, View } from 'react-native';
import { globalStyles } from '../../css';

export default function Dashboard() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={globalStyles.heading}>Emergency</Text>

      <Text>Emergency</Text>
      <Text>What's Next</Text>
      <Text>Welcome, Friend</Text>
      <Button title="During/After the Quake" />
    </View>
  )
};
