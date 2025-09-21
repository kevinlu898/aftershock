import { Image, Text, TextInput, View } from 'react-native';
import { globalStyles } from '../css';

export default function Landing() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={globalStyles.heading}>Aftershock</Text>
        <View>
            <Image
            source={{
                uri: 'https://reactnative.dev/docs/assets/p_cat2.png',
            }}
            style={{width: 200, height: 200}}
            />
        </View>
        <TextInput
            style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            }}
            defaultValue="Type"
        />
        </View>
    );
}