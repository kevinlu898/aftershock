import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, globalStyles } from "../../css";
import { getData } from "../../storage/storageUtils";
import prepareStyles from "../Prepare/prepareStyles";
import emergencyStyles from "./EmergencyStyles";

// alias so existing references to localStyles keep working
const localStyles = emergencyStyles;

// Renders dropdown content (Important Documents moved before Post-shaking Checklist)
const EMERGENCY_MODULES = [
  {
    id: "2",
    title: "Important Documents",
    description: "Keep copies of vital documents accessible. View saved images and file metadata here.",
    checklistItems: [],
    icon: "file-document",
  },
  {
    id: "1",
    title: "Post-shaking Checklist",
    description: "Keep yourself safe after an earthquake.",
    checklistItems: [
      { id: 1, text: "Check yourself and others for injuries.", completed: false },
      { id: 2, text: "Be prepared for aftershocks.", completed: false },
      { id: 3, text: "Inspect your home for structural damage and hazards (gas, water, electric).", completed: false },
      { id: 4, text: "Turn off utilities if you suspect leaks or damage.", completed: false },
      { id: 5, text: "Listen to emergency broadcasts for updates and instructions.", completed: false },
      { id: 6, text: "Limit phone use to emergencies only.", completed: false },
      { id: 7, text: "Stay away from damaged buildings and areas.", completed: false },
      { id: 8, text: "Wear sturdy shoes and protective clothing if you must go outside.", completed: false },
      { id: 9, text: "Check for fires and extinguish if safe to do so.", completed: false },
      { id: 10, text: "Help neighbors who may require special assistance.", completed: false },
    ],
  },
];

export default function Emergency() {
  const navigation = useNavigation();
  const [expandedModule, setExpandedModule] = useState(null);
  const [emergencyCards, setEmergencyCards] = useState([]);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [medicalList, setMedicalList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const alertedRef = useRef(false);

  const EmergencyContactsList = ({ contacts }) => {
    let list = contacts ?? emergencyContacts;
    const count = Array.isArray(list) ? list.length : list ? 1 : 0;
    console.log("the list is here" + count);
    if (!list || (Array.isArray(list) && list.length === 0)) {
      return (
        <View style={localStyles.emptyState}>
          <MaterialCommunityIcons name="account-alert" size={48} color={colors.muted} />
          <Text style={localStyles.emptyStateText}>
            No emergency contacts saved.
          </Text>
        </View>
      );
    }

    if (!Array.isArray(list)) list = [list];

    return (
      <View style={localStyles.contactsContainer}>
        {list.map((c, idx) => {
          const name = c.name || c.raw?.name || "Unnamed";
          const phone =
            c.phone || c.contact || c.raw?.phone || c.raw?.contact || "-";
          const relation = c.relation || c.raw?.relation || c.raw?.rel || "";
          return (
            <View key={idx} style={localStyles.contactCard}>
              <View style={localStyles.contactIcon}>
                <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
              </View>
              <View style={localStyles.contactText}>
                <Text style={localStyles.contactName}>{name}</Text>
                <Text style={localStyles.contactDetail}>
                  {relation ? `${relation} • ${phone}` : `${phone}`}
                </Text>
              </View>
              <TouchableOpacity style={localStyles.contactAction}>
                <MaterialCommunityIcons name="phone" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  // Renders medical info
  const MedicalInfoList = ({ medicalList: medicalListProp }) => {
    let list = medicalListProp ?? medicalList;
    if (typeof list === "string") {
      return (
        <View>
          {list.map((m, idx) => {
            const title = m.name || m.raw?.name || "Medical Record";
            let nested = null;
            if (typeof m.notes === "string") {
              try {
                const parsed = JSON.parse(m.notes);
                if (Array.isArray(parsed)) nested = parsed;
              } catch (_e) {
              }
            }

            return (
              <View key={idx} style={localStyles.medCard}>
                <View style={localStyles.medHeader}>
                  <MaterialCommunityIcons name="medical-bag" size={20} color={colors.danger} />
                  <Text style={localStyles.medTitle}>{title}</Text>
                </View>
                <View style={localStyles.medContent}>
                  {m.medications && (
                    <View style={localStyles.medField}>
                      <Text style={localStyles.medLabel}>Medications</Text>
                      <Text style={localStyles.medValue}>{m.medications}</Text>
                    </View>
                  )}
                  {m.allergies && (
                    <View style={localStyles.medField}>
                      <Text style={localStyles.medLabel}>Allergies</Text>
                      <Text style={localStyles.medValue}>{m.allergies}</Text>
                    </View>
                  )}
                  {m.bloodType && (
                    <View style={localStyles.medField}>
                      <Text style={localStyles.medLabel}>Blood Type</Text>
                      <Text style={localStyles.medValue}>{m.bloodType}</Text>
                    </View>
                  )}

                  {nested ? (
                    <View style={{ marginTop: 12 }}>
                      {nested.map((n, i) => (
                        <View key={i} style={localStyles.nestedMed}>
                          <Text style={localStyles.medSubtitle}>
                            {n.name || "Medical Record"}
                          </Text>
                          {n.medications && (
                            <Text style={localStyles.medDetail}>
                              Medications: {n.medications}
                            </Text>
                          )}
                          {n.allergies && (
                            <Text style={localStyles.medDetail}>
                              Allergies: {n.allergies}
                            </Text>
                          )}
                          {n.bloodType && (
                            <Text style={localStyles.medDetail}>
                              Blood Type: {n.bloodType}
                            </Text>
                          )}
                          {n.notes && (
                            <Text style={localStyles.medDetail}>{n.notes}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    m.notes && (
                      <View style={localStyles.medField}>
                        <Text style={localStyles.medLabel}>Notes</Text>
                        <Text style={localStyles.medValue}>{m.notes}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    if (!Array.isArray(list)) list = [list];

    if (list.length === 0) {
      return (
        <View style={localStyles.emptyState}>
          <MaterialCommunityIcons name="medical-bag" size={48} color={colors.muted} />
          <Text style={localStyles.emptyStateText}>
            No medical information saved.
          </Text>
        </View>
      );
    }

    return (
      <View style={localStyles.medicalContainer}>
        {list.map((m, idx) => (
          <View key={idx} style={localStyles.medCard}>
            <View style={localStyles.medHeader}>
              <MaterialCommunityIcons name="medical-bag" size={20} color={colors.danger} />
              <Text style={localStyles.medTitle}>
                {m.name || m.raw?.name || "Medical Record"}
              </Text>
            </View>
            <View style={localStyles.medContent}>
              {m.medications && (
                <View style={localStyles.medField}>
                  <Text style={localStyles.medLabel}>Medications</Text>
                  <Text style={localStyles.medValue}>{m.medications}</Text>
                </View>
              )}
              {m.allergies && (
                <View style={localStyles.medField}>
                  <Text style={localStyles.medLabel}>Allergies</Text>
                  <Text style={localStyles.medValue}>{m.allergies}</Text>
                </View>
              )}
              {m.bloodType && (
                <View style={localStyles.medField}>
                  <Text style={localStyles.medLabel}>Blood Type</Text>
                  <Text style={localStyles.medValue}>{m.bloodType}</Text>
                </View>
              )}
              {m.notes && (
                <View style={localStyles.medField}>
                  <Text style={localStyles.medLabel}>Notes</Text>
                  <Text style={localStyles.medValue}>{m.notes}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Load data from async storage
  const loadEmergencyData = async () => {
    try {
      const stateRaw =
        (await AsyncStorage.getItem("emergencyState")) ||
        (await getData("emergencyState")) ||
        "no";
      setEmergencyActive(String(stateRaw).toLowerCase() === "yes");

      let contacts = [];
      let contactsRaw = null;
      try {
        contactsRaw = await AsyncStorage.getItem("emergency_contacts");
      } catch (_) {}
      if (!contactsRaw) {
        try {
          contactsRaw = await AsyncStorage.getItem("emergencyContacts");
        } catch (_) {}
      }
      // fall back to getData helper which may return parsed values
      if (!contactsRaw) {
        try {
          const helperVal = await getData("emergency_contacts");
          if (helperVal) contactsRaw = helperVal;
        } catch (_) {}
      }
      if (!contactsRaw) {
        try {
          const helperVal = await getData("emergencyContacts");
          if (helperVal) contactsRaw = helperVal;
        } catch (_) {}
      }

      if (contactsRaw) {
        if (typeof contactsRaw === "string") {
          try {
            const parsed = JSON.parse(contactsRaw);
            contacts = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            contacts = [{ name: null, contact: contactsRaw }];
          }
        } else if (Array.isArray(contactsRaw)) {
          contacts = contactsRaw;
        } else if (typeof contactsRaw === "object") {
          contacts = [contactsRaw];
        }
      }
      console.log(contacts.length);
      setEmergencyContacts(contacts);

      let med = [];
      try {
        const medRaw = await AsyncStorage.getItem("medical_info");
        if (medRaw) {
          try {
            const parsed = JSON.parse(medRaw);
            med = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            med = [medRaw];
          }
        } else {
          med = [];
        }
      } catch (e) {
        console.warn(
          "Emergency: failed to read medical_info from AsyncStorage",
          e
        );
        med = [];
      }

      med = med
        .map((m) => {
          if (!m) return null;
          if (typeof m === "string")
            return {
              id: null,
              name: null,
              notes: m,
              medications: null,
              allergies: null,
              bloodType: null,
              raw: m,
            };
          return {
            id: m.id || m._id || null,
            name: m.name || m.fullName || null,
            medications: m.medications || m.Medications || m.meds || null,
            allergies: m.allergies || m.Allergies || null,
            bloodType: m.bloodType || m.BloodType || m.blood || null,
            notes: m.notes || m.Notes || null,
            raw: m,
          };
        })
        .filter(Boolean);
      setMedicalList(med);

      let docs = [];
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
      setDocuments(docs);
    } catch (e) {
      console.warn("Emergency: failed to load emergency data", e);
    }
  };

 
  useEffect(() => {
    loadEmergencyData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEmergencyData();
    }, [])
  );

  const FoodWater = () => (
    <ScrollView style={localStyles.infoContainer}>
      <View style={localStyles.infoSection}>
        <Text style={localStyles.infoDescription}>• Store 1 gallon of water per person per day (for at least 3 days).</Text>
        <Text style={localStyles.infoDescription}>• Keep non-perishable food like canned goods, protein bars, and dried fruit.</Text>
        <Text style={localStyles.infoDescription}>• Have a manual can opener and disposable utensils.</Text>
        <Text style={localStyles.infoDescription}>• Replace food and water every 6 months.</Text>
        <Text style={localStyles.infoDescription}>• If tap water is unsafe, boil it or use purification tablets.</Text>
      </View>
    </ScrollView>
  );

  const Aftershocks = () => (
    <ScrollView style={localStyles.infoContainer}>
      <View style={localStyles.infoSection}>
        <Text style={localStyles.infoDescription}>• Expect more shaking after the main earthquake.</Text>
        <Text style={localStyles.infoDescription}>• Drop, Cover, and Hold On during each aftershock.</Text>
        <Text style={localStyles.infoDescription}>• Stay away from damaged buildings, walls, and power lines.</Text>
        <Text style={localStyles.infoDescription}>• Check for gas leaks or fires before re-entering any area.</Text>
        <Text style={localStyles.infoDescription}>• Listen to local alerts and contact family when safe.</Text>
      </View>
    </ScrollView>
  );  

  // Render contact info
  useEffect(() => {
    const dataFetch = async () => {
      setEmergencyCards([
        {
          id: "1",
          title: "Emergency Contacts",
          icon: "phone",
          component: EmergencyContactsList,
        },
        {
          id: "2",
          title: "Medical Info",
          icon: "clipboard-pulse",
          component: MedicalInfoList,
        },
        {
          id: "3",
          title: "Food & Water",
          icon: "water",
          component: FoodWater,
        },
        {
          id: "4",
          title: "Aftershocks",
          icon: "home-alert",
          component: Aftershocks,
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
    );
    const toggleItem = (itemId) => {
      const updatedChecklist = checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setChecklist(updatedChecklist);
    };
    return (
      <View style={[prepareStyles.card, localStyles.moduleCard]}>
        <TouchableOpacity
          style={[prepareStyles.cardHeader, localStyles.cardHeader]}
          onPress={() => toggleModule(module.id)}
          activeOpacity={0.7}
        >
          <View style={prepareStyles.headerLeft}>
            <View style={prepareStyles.headerText}>
              <Text style={[prepareStyles.moduleTitle, localStyles.moduleTitle]}>
                {module.title}
              </Text>
              <Text style={[localStyles.moduleDescription]}>
                {module.description}
              </Text>
            </View>
          </View>
          <View style={prepareStyles.headerRight}>
            <MaterialCommunityIcons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.primary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={prepareStyles.lessonsContainer}>
            {module.title && module.title.toLowerCase().includes("important") ? (
              <View style={localStyles.documentsContainer}>
                {documents && documents.length > 0 ? (
                  documents.map((d, i) => {
                    const uri = d.uri || d.path || d.raw?.uri;
                    const isImage =
                      typeof uri === "string" &&
                      /\.(jpe?g|png|gif|bmp|webp|heic|heif)$/i.test(uri);
                    return (
                      <View key={d.id || uri || i} style={localStyles.docCard}>
                        {isImage && (
                          <Image
                            source={{ uri }}
                            style={localStyles.docThumb}
                          />
                        )}
                        <View style={localStyles.docText}>
                          <Text style={localStyles.docTitle}>
                            {d.title || d.fileName || uri || "Document"}
                          </Text>
                          <Text style={localStyles.docMeta}>
                            {d.fileName || uri}
                          </Text>
                        </View>
                        <TouchableOpacity style={localStyles.docAction}>
                          <MaterialCommunityIcons name="download" size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : (
                  <View style={localStyles.emptyState}>
                    <MaterialCommunityIcons name="file-document" size={48} color={colors.muted} />
                    <Text style={localStyles.emptyStateText}>
                      No important documents saved.
                    </Text>
                  </View>
                )}
              </View>
            ) : module.title && module.title.toLowerCase().includes("medical") ? (
              <View style={localStyles.medicalContainer}>
                <MedicalInfoList />
              </View>
            ) : (
              <View style={localStyles.lessonChecklistContainer}>
                {checklist.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      localStyles.lessonChecklistItem,
                      item.completed && localStyles.lessonChecklistItemCompleted,
                    ]}
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={localStyles.lessonChecklistLeft}>
                      <View
                        style={[
                          localStyles.lessonCheckbox,
                          item.completed && localStyles.lessonCheckboxCompleted,
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
                          localStyles.lessonChecklistText,
                          item.completed && localStyles.lessonChecklistTextCompleted,
                        ]}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const ModuleCardSquare = ({ module }) => {
    const [visible, setVisible] = useState(false);
    const statusColor = colors.primary;
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
          style={[localStyles.quickActionCard]}
          activeOpacity={0.85}
          onPress={openModal}
        >
          <View style={localStyles.quickActionContent}>
            <View
              style={[
                localStyles.quickActionIcon,
                { backgroundColor: `${statusColor}15` },
              ]}
            >
              <MaterialCommunityIcons
                name={module.icon}
                size={36} // increased icon size
                color={statusColor}
              />
            </View>
            <Text style={localStyles.quickActionTitle}>
              {module.title}
            </Text>
          </View>
        </TouchableOpacity>
        <Modal
          visible={visible}
          animationType="none"
          transparent={true}
          onRequestClose={closeModal}
          statusBarTranslucent={true}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View
              style={[localStyles.modalBackdrop, { opacity: backdropOpacity }]}
            >
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    localStyles.modalCard,
                    {
                      transform: [{ scale: contentScale }],
                      opacity: contentOpacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={localStyles.modalCloseButton}
                    onPress={closeModal}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                  <View style={localStyles.modalHeader}>
                    <View style={localStyles.modalIcon}>
                      <MaterialCommunityIcons
                        name={module.icon}
                        size={40} // increased modal/header icon size
                        color={statusColor}
                      />
                    </View>
                    <Text style={localStyles.modalTitle}>
                      {module.title}
                    </Text>
                  </View>
                  <View style={localStyles.modalContent}>
                    {(() => {
                      const Comp = module.component;
                      if (typeof Comp === "function") {
                        return (
                          <ScrollView
                            style={localStyles.modalScroll}
                            contentContainerStyle={{ paddingBottom: 12 }}
                            showsVerticalScrollIndicator
                          >
                            <Comp
                              contacts={emergencyContacts}
                              medicalList={medicalList}
                              documents={documents}
                            />
                          </ScrollView>
                        );
                      }
                      return <View style={localStyles.modalScroll}>{Comp || null}</View>;
                    })()}
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={localStyles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={localStyles.header}>
        <Text style={globalStyles.heading}>Emergency Hub</Text>
        <Text style={localStyles.subtitle}>
          Your safety resources and emergency checklist
        </Text>
      </View>

      {emergencyActive && (
        <View style={localStyles.emergencyBanner}>
          <View style={localStyles.bannerContent}>
            <Text style={localStyles.bannerTitle}>
              EARTHQUAKE — DROP, COVER, HOLD ON
            </Text>
            <Text style={localStyles.bannerSubtitle}>
              An earthquake has been detected near you. Move to safe cover now.
            </Text>
          </View>
          <TouchableOpacity
            style={localStyles.localRiskButton}
            onPress={() => navigation.navigate("LocalRisk")}
          >
            <Text style={localStyles.localRiskButtonText}>
              View Current Earthquakes
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions Grid */}
      <View style={localStyles.quickActionsGrid}>
        {emergencyCards.map((module) => (
          <ModuleCardSquare key={module.id} module={module} />
        ))}
      </View>

      {/* Emergency Checklists */}
      <View style={localStyles.checklistsSection}>
        {EMERGENCY_MODULES.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </View>
    </ScrollView>
  );
}