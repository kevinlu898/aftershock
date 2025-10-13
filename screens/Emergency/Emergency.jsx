import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, fontSizes, globalStyles } from "../../css";
import { getData } from "../../storage/storageUtils";
import prepareStyles from "../Prepare/prepareStyles";
import { PREPARE_MODULES as EMERGENCY_MODULES } from "./prepareModules";

export default function Emergency() {
  const [expandedModule, setExpandedModule] = useState(null);
  const [emergencyCards, setEmergencyCards] = useState([]);

  // extracted styles for reuse and readability
  const alertBannerStyle = {
    backgroundColor: "#D90429",
    paddingVertical: 24,
    alignItems: "center",
    padding: 5,
    marginBottom: 20,
    borderRadius: 12,
  };

  const modalContainerStyle = {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  };

  const modalContentStyle = {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    minWidth: 280,
    width: "90%",
    maxWidth: 420,
    alignItems: "center",
    position: "relative",
  };

  const checklistStyles = {
    // Checklist styles
    lessonChecklistContainer: {
      marginBottom: 5,
      backgroundColor: '#f8faf8',
      borderRadius: 8,
    },
    lessonChecklistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
      paddingHorizontal: 12,
      backgroundColor: '#fff',
      borderRadius: 6,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    lessonChecklistItemCompleted: {
      backgroundColor: '#f0f7f0',
      borderColor: colors.primary,
    },
    lessonChecklistLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    lessonCheckbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.muted,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
      backgroundColor: '#fff',
    },
    lessonCheckboxCompleted: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    lessonChecklistText: {
      fontSize: 14,
      color: colors.secondary,
      flex: 1, 
      lineHeight: 20,
    },
    lessonChecklistTextCompleted: {
      color: '#666',
    },
    moduleDescription: {
      fontSize: fontSizes.small,
      color: colors.muted,
      marginBottom: 0,
    },

  }

  useEffect(() => {
    const dataFetch = async () => {
      const contact1 = getData("contact1");
      const contact2 = getData("contact2");
      const contact3 = getData("contact3");
      const bloodtype = getData("bloodtype");
      const allergies = getData("allergies");
      const medications = getData("medications");
      setEmergencyCards([
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
    const [checklist, setChecklist] = useState(
      Array.isArray(module.checklistItems) ? module.checklistItems : []
    ); // Local state for checklist items
    // Toggles completion state of a checklist item
    const toggleItem = (itemId) => {
      const updatedChecklist = checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setChecklist(updatedChecklist);
    };
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
              <Text style={checklistStyles.moduleDescription}>
                {module.description}
              </Text>
            </View>
          </View>
          <View style={prepareStyles.headerRight}>
            <MaterialCommunityIcons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.secondary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={prepareStyles.lessonsContainer}>
            <View style={checklistStyles.lessonChecklistContainer}>
              {checklist.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    checklistStyles.lessonChecklistItem,
                    item.completed &&
                      checklistStyles.lessonChecklistItemCompleted,
                  ]}
                  onPress={() => toggleItem(item.id)}
                >
                  <View style={checklistStyles.lessonChecklistLeft}>
                    {/* Custom checkbox */}
                    <View
                      style={[
                        checklistStyles.lessonCheckbox,
                        item.completed &&
                          checklistStyles.lessonCheckboxCompleted,
                      ]}
                    >
                      {item.completed && (
                        <MaterialCommunityIcons
                          name="check"
                          size={16}
                          color="#fff"
                        />
                      )}
                    </View>
                    {/* Checklist item text */}
                    <Text
                      style={[
                        checklistStyles.lessonChecklistText,
                        item.completed &&
                          checklistStyles.lessonChecklistTextCompleted,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
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

    // Animated values for backdrop and content
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const contentScale = useRef(new Animated.Value(0.9)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    const openModal = () => {
      setVisible(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(contentScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    };

    const closeModal = () => {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 0, duration: 160, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(contentScale, { toValue: 0.9, duration: 160, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(() => setVisible(false));
    };

    return (
      <>
        <TouchableOpacity
          style={[
            prepareStyles.card,
            { flex: 1, justifyContent: "center", alignItems: "center" },
          ]}
          activeOpacity={0.85}
          onPress={openModal}
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
          animationType="none"
          transparent={true}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View style={[modalContainerStyle, { opacity: backdropOpacity }]}>
              <TouchableWithoutFeedback>
                <Animated.View style={[
                  modalContentStyle,
                  {
                    transform: [{ scale: contentScale }],
                    opacity: contentOpacity,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: Platform.OS === 'android' ? 8 : 0,
                  }
                ]}>
                  <TouchableOpacity
                    style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}
                    onPress={closeModal}
                  >
                    <MaterialCommunityIcons name="close" size={30} color="#D90429" />
                  </TouchableOpacity>
                  <View style={{ alignItems: 'center', marginBottom: 12 }}>
                    <MaterialCommunityIcons name={module.icon} size={56} color={statusColor} />
                  </View>
                  <Text style={{ fontWeight: '700', fontSize: 22, color: '#3B5249', textAlign: 'center', marginBottom: 8 }}>{module.title}</Text>
                  <View style={{ width: '100%', maxHeight: 420 }}>{module.component}</View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
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
      <Text style={globalStyles.heading}>Emergency Hub</Text>

      {/* Critical Alert Banner (Top) */}
      <View style={alertBannerStyle}>
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 22,
            textAlign: "center",
            padding: 1,
            letterSpacing: 1,
          }}
        >
          EARTHQUAKE! DROP, COVER, HOLD ON
        </Text>
      </View>
      {/* end the top red */}

      {/* Modules List in 2x2 Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {emergencyCards.map((module) => (
          <View key={module.id} style={{ width: "50%", aspectRatio: 1, padding: 8 }}>
            <ModuleCardSquare module={module} />
          </View>
        ))}
      </View>
      {/* end 2x2 layout */}

      {/* start the checklist and the important documents */}
      <View style={{ ...prepareStyles.modulesList, marginTop: 16 }}>
        {EMERGENCY_MODULES.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </View>
    </ScrollView>
  );
}
