import { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, globalStyles } from "../../css";
import { getData } from "../../storage/storageUtils";
import prepareStyles from "../Prepare/prepareStyles";
import { PREPARE_MODULES } from "./prepareModules";

export default function Dashboard() {
  const [expandedModule, setExpandedModule] = useState(null);
  const [PREPARE_CARD, SET_PREPARE_CARD] = useState([]);

  useEffect(() => {
    const dataFetch = async () => {
      const contact1 = getData("contact1");
      const contact2 = getData("contact2");
      const contact3 = getData("contact3");
      const bloodtype = getData("bloodtype");
      const allergies = getData("allergies");
      const medications = getData("medications");
      SET_PREPARE_CARD([
        {
          id: "1",
          title: "Emergency Contacts",
          icon: "brain",
          component: (
            <View>
              <Text>List and manage your emergency contacts here.</Text>
              <Text>Cotnact 1: {contact1}</Text>
              <Text>Cotnact 2: {contact2}</Text>
              <Text>Cotnact 3: {contact3}</Text>
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
              <Text>Blood Type: {bloodtype}</Text>
              <Text>Allergies: {allergies}</Text>
              <Text>Medications: {medications}</Text>
            </View>
          ),
        },
        {
          id: "3",
          title: "Finding Food and Water",
          icon: "backpack",
          component: (
            <ScrollView>
              <View>
                <Text>- Use your emergency water supply FIRST.</Text>
                <Text>
                  - Drain your water heater for drinking water (40+ gallons).
                </Text>
                <Text>
                  - Eat refrigerated food FIRST (use within 4 hours if power is
                  out).
                </Text>
                <Text>
                  - Then eat freezer food (may last 24-48 hours without power).
                </Text>
                <Text>
                  - Listen to a battery-powered radio for official help
                  locations.
                </Text>
                <Text>
                  - Text (don&apos;t call) family to check status and pool
                  resources.
                </Text>
                <Text>
                  - Check local churches, schools, or fire stations for aid
                  centers.
                </Text>
                <Text>
                  - Check the app&apos;s Crowdsourced Map for water and food
                  distribution points.
                </Text>
              </View>
            </ScrollView>
          ),
        },
        {
          id: "4",
          title: "Aftershocks",
          icon: "home-alert",
          component: <>After shock info info info</>,
        },
      ]);
    };

    dataFetch();
  }, []);

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const ModuleCard = ({ module }) => {
    const isExpanded = expandedModule === module.id;
    const statusColor = module.completed
      ? "#10B981"
      : module.progress > 0
      ? colors.primary
      : "#9CA3AF";

    return (
      <View style={prepareStyles.card}>
        <TouchableOpacity
          style={prepareStyles.cardHeader}
          onPress={() => toggleModule(module.id)}
          activeOpacity={0.7}
        >
          <View style={prepareStyles.headerLeft}>
            <View style={prepareStyles.headerText}>
              <Text style={prepareStyles.moduleTitle}>{module.title}</Text>
              <Text style={prepareStyles.moduleDescription}>
                {module.description}
              </Text>
            </View>
          </View>
          <View style={prepareStyles.headerRight}>
            <Text style={[prepareStyles.progressText, { color: statusColor }]}>
              {Math.round(module.progress * 100)}%
            </Text>
            <MaterialCommunityIcons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.secondary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={prepareStyles.lessonsContainer}>
            {module.lessons.map((lesson, index) => (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  prepareStyles.lessonItem,
                  index === module.lessons.length - 1 &&
                    prepareStyles.lastLessonItem,
                ]}
                activeOpacity={0.6}
                onPress={() =>
                  navigation.navigate("prepareLessons", {
                    lessonId: lesson.id,
                    moduleId: module.id,
                    lessonData: lesson,
                  })
                }
              >
                <View style={prepareStyles.lessonLeft}>
                  <MaterialCommunityIcons
                    name={lesson.completed ? "check-circle" : "circle-outline"}
                    size={20}
                    color={lesson.completed ? "#10B981" : colors.secondary}
                  />
                  <Text
                    style={[
                      prepareStyles.lessonTitle,
                      lesson.completed && prepareStyles.completedLesson,
                    ]}
                  >
                    {lesson.title}
                  </Text>
                </View>
                <View style={prepareStyles.lessonRight}>
                  <Text style={prepareStyles.lessonDuration}>
                    {lesson.duration}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={16}
                    color={colors.secondary}
                  />
                </View>
              </TouchableOpacity>
            ))}

            <View style={prepareStyles.buttonContainer}>
              {module.progress === 0 ? (
                <TouchableOpacity style={prepareStyles.primaryButton}>
                  <Text style={prepareStyles.primaryButtonText}>Start</Text>
                </TouchableOpacity>
              ) : module.progress >= 0.9 && module.progress < 1 ? (
                <TouchableOpacity style={prepareStyles.primaryButton}>
                  <Text style={prepareStyles.primaryButtonText}>Finish</Text>
                </TouchableOpacity>
              ) : module.progress === 1 ? (
                <TouchableOpacity style={prepareStyles.secondaryButton}>
                  <Text style={prepareStyles.secondaryButtonText}>Review</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={prepareStyles.primaryButton}>
                  <Text style={prepareStyles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

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
      contentContainerStyle={{
        ...prepareStyles.contentContainer,
        paddingBottom: 64,
      }}
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
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
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

      {/* start the checklist and the important documents */}
      <View style={prepareStyles.modulesList}>
        {PREPARE_MODULES.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </View>
    </ScrollView>
  );
}
