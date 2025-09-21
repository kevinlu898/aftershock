import { Button, Image, Linking, Text, View } from 'react-native';
import { globalStyles } from '../css';

export default function Landing() {
    const onPress = () => {
        Linking.openURL("accountCreation")
    }
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={globalStyles.heading}>Aftershock</Text>
        <View>
            <Image
            source={require('../../assets/images/icon.png')}
            style={{width: 200, height: 200, borderRadius: 30}}
            />
        <br/>
        <Text style={globalStyles.subheading}>Earthquake Planner App</Text>
        <br/>
        <Text style={globalStyles.text}>Insert Stats</Text>
        <br/>
        </View>
        <Button
        title="Launch!"
        onPress={onPress}
        color="#3B5249"
        style={{borderRadius: 10}}
        />
        </View>
    );
}