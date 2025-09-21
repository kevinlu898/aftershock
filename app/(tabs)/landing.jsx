import { Button, Image, Linking, Text, View } from 'react-native';
import { globalStyles } from '../css';

export default function Landing() {
    const onPress = () => {
        Linking.openURL("fish")
    }
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={globalStyles.heading}>Aftershock</Text>
        <View>
            <Image
            source={require('../../assets/images/icon.png')}
            style={{width: 200, height: 200}}
            />
        </View>
        <Button
        title="Launch!"
        onPress={onPress}
        color="#3B5249"
        />
        </View>
    );
}