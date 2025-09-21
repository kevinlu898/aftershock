import { Button, Text, View } from "react-native";
import { globalStyles } from "../css";

export default function Dashboard() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={globalStyles.heading}>Welcome, Friend</Text>

      <Text>Your Progress</Text>
      <Text>What&apos;s Next</Text>
      <Text>Welcome, Friend</Text>
      <Button title="During/After the Quake">During/After the Quake</Button>
    </View>
  );
}
