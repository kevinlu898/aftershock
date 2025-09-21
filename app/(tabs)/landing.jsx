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
            source={require('../../assets/images/favicon.png')}
            style={{width: 250, height: 250, borderRadius: 30}}
            />
        <Text style={globalStyles.subheading}>{"\n"}Earthquake Planner App{"\n"} </Text>
        <Text style={globalStyles.text}>Insert Stats{"\n"} </Text>
        </View>
        <Button title="Launch!"
        onPress={onPress}
        color="#3B5249"
        style={{borderRadius: 10, alignItems: "center"}}
        />
        </View>
    );
}