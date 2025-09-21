<<<<<<< HEAD
import { Image, Text, TouchableOpacity, View, useNavigation } from 'react-native';
import { globalStyles } from '../css';

export default function Landing() {
    const onPress = () => {
        useNavigation.navigate("accountCreation")
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
        <Text style={globalStyles.text}>Insert Stats</Text>
        </View>
        <TouchableOpacity
        onPress={onPress}
        style={{
        backgroundColor: "#3B5249",
        borderRadius: 10,
        padding: 12,
        marginTop: 20,
        alignItems: "center",
        }}
        >
        <Text style={{ color: "white", fontSize: 18 }}>Launch!</Text>
        </TouchableOpacity>
        </View>
    );
}
=======
import { Button, Image, Linking, Text, View } from "react-native";
import { globalStyles } from "../css";

export default function Landing() {
  const onPress = () => {
    Linking.openURL("/accountCreation");
  };
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={globalStyles.heading}>Aftershock</Text>
      <View>
        <Image
          source={require("../../assets/images/favicon.png")}
          style={{ width: 250, height: 250, borderRadius: 30 }}
        />
        <Text style={globalStyles.subheading}>
          {"\n"}Earthquake Planner App{"\n"}{" "}
        </Text>
        <Text style={globalStyles.text}>Insert Stats{"\n"} </Text>
      </View>
      <Button
        title="Launch!"
        onPress={onPress}
        color="#3B5249"
        style={{ borderRadius: 10, alignItems: "center" }}
      />
    </View>
  );
}
>>>>>>> 91673df3dc53cf40676380c5032e6fd2b9ce432b
