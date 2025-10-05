import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { globalStyles } from "../../css";
import prepareStyles from "../Prepare/prepareStyles";
import { PREPARE_CARD } from "./prepareCard";

export default function Dashboard() {
  // Module Card
  const ModuleCardSquare = ({ module }) => {
    const [visible, setVisible] = useState(false);
    const statusColor = "#3B5249";
    return (
      <>
        <TouchableOpacity
          style={[
            prepareStyles.card,
            { flex: 1, justifyContent: "center", alignItems: "center" },
          ]}
          activeOpacity={0.85}
          onPress={() => setVisible(true)}
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
        </TouchableOpacity>
        <Modal
          visible={visible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 24,
                padding: 32,
                minWidth: 280,
                width: "90%",
                maxWidth: 400,
                alignItems: "center",
                position: "relative",
              }}
            >
              <TouchableOpacity
                style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}
                onPress={() => setVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={36}
                  color="#D90429"
                />
              </TouchableOpacity>
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <MaterialCommunityIcons
                  name={module.icon}
                  size={60}
                  color={statusColor}
                />
              </View>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 32,
                  color: "#3B5249",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                {module.title}
              </Text>
              <Text
                style={{ color: "#666", fontSize: 20, textAlign: "center" }}
              >
                {module.component}
              </Text>
            </View>
          </View>
        </Modal>
      </>
    );
  };
  // end of component

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={prepareStyles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* title */}
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
      {/* end the top red */}

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
            <ModuleCardSquare module={module} />
          </View>
        ))}
      </View>
      {/* end 2x2 layout */}
    </ScrollView>
  );
}
