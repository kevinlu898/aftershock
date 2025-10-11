import { Text, View } from "react-native";

export const PREPARE_CARD = [
  {
    id: "1",
    title: "Emergency Contacts",
    icon: "brain",
    component: (
      <View>
        <Text>List and manage your emergency contacts here.</Text>
        <Text>Cotnact 1: fish</Text>
        <Text>Cotnact 2: fish</Text>
        <Text>Cotnact 3: fish</Text>
      </View>
    ),
  },
  {
    id: "2",
    title: "Medical Info",
    icon: "clipboard-list",
    component: (
      <View>
        <Text>List and manage your medical info here.</Text>
        <Text>Blood Type: A+</Text>
        <Text>Allergies: fish</Text>
        <Text>Medications: fish</Text>
      </View>
    ),
  },
  {
    id: "3",
    title: "Finding Food and Water",
    icon: "backpack",
    component: (
      <View>
        <Text>Use your emergency water supply FIRST.</Text>
        <Text>Drain your water heater for drinking water (40+ gallons).</Text>
        <Text>
          Eat refrigerated food FIRST (use within 4 hours if power is out).
        </Text>
        <Text>Then eat freezer food (may last 24-48 hours without power).</Text>
        <Text>
          Listen to a battery-powered radio for official help locations.
        </Text>
        <Text>
          Text (don&apos;t call) family to check status and pool resources.
        </Text>
        <Text>
          Check local churches, schools, or fire stations for aid centers.
        </Text>
        <Text>
          Check the app's Crowdsourced Map for water and food distribution
          points.
        </Text>
      </View>
    ),
  },
  {
    id: "4",
    title: "Aftershocks",
    icon: "home-alert",
    component: <>After shock info info info</>,
  },
];
