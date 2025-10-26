import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, fontSizes, globalStyles } from "../../css";
import { getData } from "../../storage/storageUtils";
import prepareStyles from "../Prepare/prepareStyles";
import { PREPARE_MODULES as EMERGENCY_MODULES } from "./prepareModules";

export default function Emergency() {
  const navigation = useNavigation();
  const [expandedModule, setExpandedModule] = useState(null);
  const [emergencyCards, setEmergencyCards] = useState([]);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [medicalList, setMedicalList] = useState([]);
  const [documents, setDocuments] = useState([]);

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
    lessonChecklistContainer: {
      marginBottom: 5,
      backgroundColor: "#f8faf8",
      borderRadius: 8,
    },
    lessonChecklistItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 13,
      paddingHorizontal: 12,
      backgroundColor: "#fff",
      borderRadius: 6,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },
    lessonChecklistItemCompleted: {
      backgroundColor: "#f0f7f0",
      borderColor: colors.primary,
    },
    lessonChecklistLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    lessonCheckbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.muted,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      backgroundColor: "#fff",
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
      color: "#666",
    },
    moduleDescription: {
      fontSize: fontSizes.small,
      color: colors.muted,
      marginBottom: 0,
    },
  };

  useEffect(() => {
    const dataFetch = async () => {
      const contact1 = await getData("contact1");
      const contact2 = await getData("contact2");
      const contact3 = await getData("contact3");
      const bloodtype = await getData("bloodtype");
      const allergies = await getData("allergies");
      const medications = await getData("medications");
      setEmergencyCards([
        {
          id: "1",
          title: "Emergency Contacts",
          icon: "phone",
          component: (
            <View>
              <Text>List and manage your emergency contacts here.</Text>
              <Text>Contact 1: {contact1}</Text>
              <Text>Contact 2: {contact2}</Text>
              <Text>Contact 3: {contact3}</Text>
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
          icon: "water",
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

  useEffect(() => {
    const loadEmergencyData = async () => {
      try {
        const stateRaw =
          (await AsyncStorage.getItem("emergencyState")) ||
          (await getData("emergencyState")) ||
          "no";
        setEmergencyActive(String(stateRaw).toLowerCase() === "yes");

        let contacts = [];
        const contactsFromHelper = await getData("emergencyContacts");
        if (contactsFromHelper) {
          contacts = Array.isArray(contactsFromHelper)
            ? contactsFromHelper
            : [contactsFromHelper];
        } else {
          const contactsRaw = await AsyncStorage.getItem("emergencyContacts");
          if (contactsRaw) {
            try {
              const parsed = JSON.parse(contactsRaw);
              contacts = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              contacts = [{ name: null, contact: contactsRaw }];
            }
          } else {
            const c1 = await getData("contact1");
            const c2 = await getData("contact2");
            const c3 = await getData("contact3");
            if (c1)
              contacts.push(
                typeof c1 === "string" ? { name: null, contact: c1 } : c1
              );
            if (c2)
              contacts.push(
                typeof c2 === "string" ? { name: null, contact: c2 } : c2
              );
            if (c3)
              contacts.push(
                typeof c3 === "string" ? { name: null, contact: c3 } : c3
              );
          }
        }
        contacts = contacts
          .map((c) => {
            if (!c) return null;
            if (typeof c === "string") return { name: null, contact: c };
            if (typeof c === "object") {
              return {
                name: c.name || c.label || null,
                phone: c.phone || c.contact || c.value || null,
                raw: c,
              };
            }
            return { name: null, contact: String(c) };
          })
          .filter(Boolean);
        setEmergencyContacts(contacts);

        let med = [];
        const medFromHelper = await getData("medical_info");
        if (medFromHelper) {
          med = Array.isArray(medFromHelper) ? medFromHelper : [medFromHelper];
        } else {
          const medRaw = await AsyncStorage.getItem("medical_info");
          if (medRaw) {
            try {
              const parsed = JSON.parse(medRaw);
              med = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              med = [medRaw];
            }
          }
        }
        med = med
          .map((m) => {
            if (!m) return null;
            if (typeof m === "string") return { name: null, notes: m };
            return {
              id: m.id || m._id || null,
              name: m.name || m.fullName || null,
              medications: m.medications || m.Medications || m.meds || null,
              allergies: m.allergies || m.Allergies || null,
              bloodType: m.bloodType || m.BloodType || m.blood || null,
              raw: m,
            };
          })
          .filter(Boolean);
        setMedicalList(med);

        let docs = [];
        const docsFromHelper =
          (await getData("important_documents")) ||
          (await getData("importantDocuments"));
        if (docsFromHelper) {
          docs = Array.isArray(docsFromHelper)
            ? docsFromHelper
            : [docsFromHelper];
        } else {
          const docsRaw =
            (await AsyncStorage.getItem("important_documents")) ||
            (await AsyncStorage.getItem("importantDocuments"));
          if (docsRaw) {
            try {
              const parsed = JSON.parse(docsRaw);
              docs = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              docs = [docsRaw];
            }
          }
        }
        docs = docs
          .map((d) => {
            if (!d) return null;
            if (typeof d === "string")
              return { id: null, title: d, fileName: null, uri: d };
            return {
              id: d.id || d._id || null,
              title: d.title || d.name || d.fileName || null,
              fileName: d.fileName || d.name || null,
              uri: d.uri || d.path || null,
              raw: d,
            };
          })
          .filter(Boolean);
        setDocuments(docs);
      } catch (e) {
        console.warn("Emergency: failed to load emergency data", e);
      }
    };
    loadEmergencyData();
  }, []);

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const ModuleCard = ({ module }) => {
    const isExpanded = expandedModule === module.id;
    const [checklist, setChecklist] = useState(
      Array.isArray(module.checklistItems) ? module.checklistItems : []
    );
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

  const ModuleCardSquare = ({ module }) => {
    const [visible, setVisible] = useState(false);
    const statusColor = "#3B5249";
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const contentScale = useRef(new Animated.Value(0.9)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    const openModal = () => {
      setVisible(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(contentScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const closeModal = () => {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentScale, {
          toValue: 0.9,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
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
            <Animated.View
              style={[modalContainerStyle, { opacity: backdropOpacity }]}
            >
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    modalContentStyle,
                    {
                      transform: [{ scale: contentScale }],
                      opacity: contentOpacity,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.12,
                      shadowRadius: 12,
                      elevation: Platform.OS === "android" ? 8 : 0,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 2,
                    }}
                    onPress={closeModal}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={30}
                      color="#D90429"
                    />
                  </TouchableOpacity>
                  <View style={{ alignItems: "center", marginBottom: 12 }}>
                    <MaterialCommunityIcons
                      name={module.icon}
                      size={56}
                      color={statusColor}
                    />
                  </View>
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 22,
                      color: "#3B5249",
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    {module.title}
                  </Text>
                  <View style={{ width: "100%", maxHeight: 420 }}>
                    {module.component}
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
  };

  const MiniCard = ({ title, children }) => (
    <View style={localStyles.miniCard}>
      <Text style={localStyles.miniCardTitle}>{title}</Text>
      <View>{children}</View>
    </View>
  );

  // Always render the standard Emergency Hub UI. If an earthquake is active,
  // show the prominent banner directly under the page title.
  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{
        ...prepareStyles.contentContainer,
        paddingBottom: 64,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={globalStyles.heading}>Emergency Hub</Text>

      {emergencyActive && (
        <View style={localStyles.largeBanner}>
          <Text style={localStyles.bannerTitle}>
            EARTHQUAKE — DROP, COVER, HOLD
          </Text>
          <Text style={localStyles.bannerSubtitle}>
            An earthquake has been detected near you. Move to safe cover now.
          </Text>
          <TouchableOpacity
            style={localStyles.localRiskButton}
            onPress={() => navigation.navigate("LocalRisk")}
          >
            <Text style={localStyles.localRiskButtonText}>
              View current earthquakes
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* default grid of quick cards */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {emergencyCards.map((module) => (
          <View
            key={module.id}
            style={{ width: "50%", aspectRatio: 1, padding: 8 }}
          >
            <ModuleCardSquare module={module} />
          </View>
        ))}
      </View>

      <View style={{ ...prepareStyles.modulesList, marginTop: 16 }}>
        {EMERGENCY_MODULES.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  alertBanner: {
    backgroundColor: "#D90429",
    paddingVertical: 24,
    alignItems: "center",
    padding: 5,
    marginBottom: 20,
    borderRadius: 12,
  },
  alertText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
    textAlign: "center",
    padding: 1,
    letterSpacing: 1,
  },
});

const localStyles = StyleSheet.create({
  emergencyContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: colors.light,
  },
  largeBanner: {
    backgroundColor: "#D90429",
    padding: 20,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  localRiskButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  localRiskButtonText: {
    color: "#D90429",
    fontWeight: "700",
  },
  miniCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  miniCardTitle: {
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 8,
  },
  itemText: { color: colors.secondary, marginBottom: 6 },
  itemTextMuted: { color: colors.muted, fontStyle: "italic" },

  rowIcon: { marginRight: 10 },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  contactText: { flex: 1 },
  contactName: { fontWeight: "700", color: colors.secondary },
  contactDetail: { color: colors.muted, marginTop: 2, fontSize: 13 },

  medRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  medText: { flex: 1 },
  medTitle: { fontWeight: "700", color: colors.secondary },
  medDetail: { color: colors.muted, marginTop: 2, fontSize: 13 },

  docRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  docText: { flex: 1 },
  docTitle: { fontWeight: "700", color: colors.secondary },
  docMeta: { color: colors.muted, marginTop: 2, fontSize: 13 },
});
