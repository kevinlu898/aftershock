import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
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

  const EmergencyContactsList = ({ contacts }) => {
    let list = contacts ?? emergencyContacts;
    const count = Array.isArray(list) ? list.length : list ? 1 : 0;
    console.log("the list is here" + count);
    if (!list || (Array.isArray(list) && list.length === 0)) {
      return (
        <View>
          <Text style={localStyles.itemTextMuted}>
            No emergency contacts saved.
          </Text>
        </View>
      );
    }

    // normalize to array
    if (!Array.isArray(list)) list = [list];

    return (
      <View>
        {list.map((c, idx) => {
          const name = c.name || c.raw?.name || "Unnamed";
          const phone =
            c.phone || c.contact || c.raw?.phone || c.raw?.contact || "-";
          const relation = c.relation || c.raw?.relation || c.raw?.rel || "";
          return (
            <View key={idx} style={localStyles.contactRow}>
              <View style={localStyles.contactText}>
                <Text style={localStyles.contactName}>{name}</Text>
                <Text style={localStyles.contactDetail}>
                  {relation ? `${relation} • ${phone}` : `${phone}`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Small render component that displays medical info. It accepts an
  // optional `medicalList` prop so callers can pass fresh data; otherwise
  // it falls back to the parent `medicalList` state.
  const MedicalInfoList = ({ medicalList: medicalListProp }) => {
    let list = medicalListProp ?? medicalList;
    if (typeof list === "string") {
      return (
        <View>
          {list.map((m, idx) => {
            const title = m.name || m.raw?.name || "Medical Record";
            // If notes contains a JSON-encoded array of medical records, parse & render them
            let nested = null;
            if (typeof m.notes === "string") {
              try {
                const parsed = JSON.parse(m.notes);
                if (Array.isArray(parsed)) nested = parsed;
              } catch (_e) {
                // not JSON — leave nested as null
              }
            }

            return (
              <View key={idx} style={localStyles.medRow}>
                <View style={localStyles.medText}>
                  <Text style={localStyles.medTitle}>{title}</Text>
                  {m.medications && (
                    <Text style={localStyles.medDetail}>
                      Medications: {m.medications}
                    </Text>
                  )}
                  {m.allergies && (
                    <Text style={localStyles.medDetail}>
                      Allergies: {m.allergies}
                    </Text>
                  )}
                  {m.bloodType && (
                    <Text style={localStyles.medDetail}>
                      Blood Type: {m.bloodType}
                    </Text>
                  )}

                  {nested ? (
                    <View style={{ marginTop: 8 }}>
                      {nested.map((n, i) => (
                        <View key={i} style={{ marginBottom: 8 }}>
                          <Text style={localStyles.medTitle}>
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
                      <Text style={localStyles.medDetail}>{m.notes}</Text>
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

    return (
      <View>
        {list.map((m, idx) => (
          <View key={idx} style={localStyles.medRow}>
            <View style={localStyles.medText}>
              <Text style={localStyles.medTitle}>
                {m.name || m.raw?.name || "Medical Record"}
              </Text>
              {m.medications && (
                <Text style={localStyles.medDetail}>
                  Medications: {m.medications}
                </Text>
              )}
              {m.allergies && (
                <Text style={localStyles.medDetail}>
                  Allergies: {m.allergies}
                </Text>
              )}
              {m.bloodType && (
                <Text style={localStyles.medDetail}>
                  Blood Type: {m.bloodType}
                </Text>
              )}
              {m.notes && <Text style={localStyles.medDetail}>{m.notes}</Text>}
            </View>
          </View>
        ))}
      </View>
    );
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

  // Load emergency data from AsyncStorage (extracted so we can call it on focus)
  const loadEmergencyData = async () => {
    try {
      const stateRaw =
        (await AsyncStorage.getItem("emergencyState")) ||
        (await getData("emergencyState")) ||
        "no";
      setEmergencyActive(String(stateRaw).toLowerCase() === "yes");

      let contacts = [];
      // support multiple storage key variants and helper getter
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
        // contactsRaw may already be an object/array (from getData) or a JSON string
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

      // Always read the freshest medical_info directly from AsyncStorage
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

  // initial load on mount
  useEffect(() => {
    loadEmergencyData();
  }, []);

  // reload whenever the screen gains focus (user navigates back)
  useFocusEffect(
    useCallback(() => {
      loadEmergencyData();
    }, [])
  );

  useEffect(() => {
    const dataFetch = async () => {
      // Prepare cards; the Emergency Contacts card will render the
      // live `emergencyContacts` state via `EmergencyContactsList`.
      setEmergencyCards([
        {
          id: "1",
          title: "Emergency Contacts",
          icon: "phone",
          // store the component *type* (function) so it is rendered fresh
          component: EmergencyContactsList,
        },
        {
          id: "2",
          title: "Medical Info",
          icon: "clipboard-list",
          component: MedicalInfoList,
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
              </View>
            </ScrollView>
          ),
        },
        {
          id: "4",
          title: "Aftershocks",
          icon: "home-alert",
          component: (
            <ScrollView>
              <View style={{ paddingVertical: 6 }}>
                <Text style={{ marginBottom: 8 }}>
                  Aftershocks are common after an earthquake. They can be strong
                  enough to cause additional damage — here is what to do and
                  check in the hours and days after the main event:
                </Text>

                <Text style={{ fontWeight: "700", marginTop: 6 }}>
                  Quick safety checks
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • If you are inside, stay away from damaged walls, windows,
                  and shelves.
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • If you are outside, move to an open area clear of power
                  lines and buildings.
                </Text>

                <Text style={{ fontWeight: "700", marginTop: 6 }}>
                  Home & utilities
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • Check for gas leaks (smell or hissing). If you suspect a
                  leak, shut off the gas and leave immediately.
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • Inspect your water, sewage, and electrical systems before
                  using them — avoid using devices that spark if you suspect
                  gas.
                </Text>

                <Text style={{ fontWeight: "700", marginTop: 6 }}>
                  Food & water
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • Use your emergency water supply first. If unsure, boil or
                  treat water before drinking.
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • Throw out refrigerated food that has been above 40°F (4°C)
                  for more than 4 hours.
                </Text>

                <Text style={{ fontWeight: "700", marginTop: 6 }}>
                  Communication & planning
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • Text (do not call) family to conserve phone networks. Use
                  pre-written messages if needed.
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • Stay tuned to battery-powered or phone-based official
                  channels for updates and evacuation orders.
                </Text>

                <Text style={{ fontWeight: "700", marginTop: 6 }}>
                  When to seek help
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • If you or someone is injured, get first aid and call
                  emergency services if the situation is life-threatening.
                </Text>
                <Text style={{ marginLeft: 8, marginBottom: 6 }}>
                  • If your home is severely damaged or unsafe, follow official
                  evacuation guidance and move to a shelter.
                </Text>

                <Text style={{ marginTop: 10, fontStyle: "italic" }}>
                  Tip: Aftershocks may continue for days — keep your emergency
                  kit accessible and avoid re-entering unstable structures until
                  they are inspected.
                </Text>
              </View>
            </ScrollView>
          ),
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
            {/* If this module is the Important Documents module, render the documents list instead of the checklist */}
            {module.title &&
            module.title.toLowerCase().includes("important") ? (
              <View style={{ padding: 8 }}>
                {documents && documents.length > 0 ? (
                  documents.map((d, i) => {
                    const uri = d.uri || d.path || d.raw?.uri;
                    const isImage =
                      typeof uri === "string" &&
                      /\.(jpe?g|png|gif|bmp|webp|heic|heif)$/i.test(uri);
                    return (
                      <View key={d.id || uri || i} style={localStyles.docRow}>
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
                      </View>
                    );
                  })
                ) : (
                  <Text style={localStyles.itemTextMuted}>
                    No important documents saved.
                  </Text>
                )}
              </View>
            ) : module.title &&
              module.title.toLowerCase().includes("medical") ? (
              <View style={{ padding: 8 }}>
                {medicalList && medicalList.length > 0 ? (
                  medicalList.map((m, idx) => {
                    const title = m.name || m.raw?.name || "Medical Record";
                    // parse nested notes if JSON array
                    let nested = null;
                    if (typeof m.notes === "string") {
                      try {
                        const parsed = JSON.parse(m.notes);
                        if (Array.isArray(parsed)) nested = parsed;
                      } catch (_e) {
                        // not JSON
                      }
                    }
                    return (
                      <View key={m.id || idx} style={localStyles.medRow}>
                        <View style={localStyles.medText}>
                          <Text style={localStyles.medTitle}>{title}</Text>
                          {m.medications && (
                            <Text style={localStyles.medDetail}>
                              Medications: {m.medications}
                            </Text>
                          )}
                          {m.allergies && (
                            <Text style={localStyles.medDetail}>
                              Allergies: {m.allergies}
                            </Text>
                          )}
                          {m.bloodType && (
                            <Text style={localStyles.medDetail}>
                              Blood Type: {m.bloodType}
                            </Text>
                          )}

                          {nested ? (
                            <View style={{ marginTop: 8 }}>
                              {nested.map((n, i) => (
                                <View key={i} style={{ marginBottom: 8 }}>
                                  <Text style={localStyles.medTitle}>
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
                                    <Text style={localStyles.medDetail}>
                                      {n.notes}
                                    </Text>
                                  )}
                                </View>
                              ))}
                            </View>
                          ) : (
                            m.notes && (
                              <Text style={localStyles.medDetail}>
                                {m.notes}
                              </Text>
                            )
                          )}
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Text style={localStyles.itemTextMuted}>
                    No medical information saved.
                  </Text>
                )}
              </View>
            ) : (
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
            )}
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
                    {(() => {
                      const Comp = module.component;
                      // if the card stores a component function, render it fresh
                      if (typeof Comp === "function") {
                        return (
                          <Comp
                            contacts={emergencyContacts}
                            medicalList={medicalList}
                            documents={documents}
                          />
                        );
                      }
                      // otherwise assume it's already a React element
                      return Comp || null;
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
  docThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  docText: { flex: 1 },
  docTitle: { fontWeight: "700", color: colors.secondary },
  docMeta: { color: colors.muted, marginTop: 2, fontSize: 13 },
});
