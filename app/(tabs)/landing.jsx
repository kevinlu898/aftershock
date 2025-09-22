import { useNavigation } from "@react-navigation/native"; // <-- import from react-navigation
import { Image, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../css";

export default function Landing() {
  const navigation = useNavigation(); // <-- call the hook inside the component

  const onPress = () => {
    navigation.navigate("accountCreation"); // <-- use the navigation object
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={globalStyles.heading}>Aftershock</Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Image
          source={require("../../assets/images/favicon.png")}
          style={{
            width: 250,
            height: 250,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <Text style={globalStyles.subheading}>
          {"\n"}Earthquake Planner App{"\n"}{" "}
        </Text>
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
