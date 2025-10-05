import { ScrollView, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { globalStyles } from "../../css";
import prepareStyles from "../Prepare/prepareStyles";
import { PREPARE_CARD } from "./prepareCard";

export default function Dashboard() {
  const ModuleCard = ({ module }) => {
    const statusColor = module.completed
      ? "#10B981"
      : module.progress > 0
      ? prepareStyles.progressFill.backgroundColor
      : "#9CA3AF";

    return (
      <View
        style={[
          prepareStyles.card,
          { flex: 1, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <View
            style={[
              prepareStyles.iconContainer,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={module.icon}
              size={32}
              color={statusColor}
            />
          </View>
          <Text
            style={[
              prepareStyles.moduleTitle,
              { textAlign: "center", marginTop: 8 },
            ]}
          >
            {module.title}
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        ></View>
      </View>
    );
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={prepareStyles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={globalStyles.heading}>Disaster Management Center</Text>

      {/* Critical Alert Banner (Top) */}
      <View
        style={{
          backgroundColor: "#D90429",
          paddingVertical: 24,
          alignItems: "center",
          marginBottom: 20,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 24,
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          EARTHQUAKE! DROP, COVER, HOLD ON
        </Text>
      </View>

      {/* Modules List in 2x2 Grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {PREPARE_CARD.map((module) => (
          <View
            key={module.id}
            style={{ width: "50%", aspectRatio: 1, padding: 8 }}
          >
            <ModuleCard module={module} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
