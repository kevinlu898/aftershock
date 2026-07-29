import { Button } from "../../components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppIcon } from "../../components/app-icon";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { PageHeader, SectionHeader, StatusCard } from "../../components/app-ui";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Modal, ScrollView, Text, TouchableWithoutFeedback, View } from "react-native";
import { getData } from "../../lib/storage/storageUtils";
import { useTheme } from "../../lib/theme";

// alias so existing references to localStyles keep working

// Renders dropdown content (Important Documents moved before Post-shaking Checklist)
const EMERGENCY_MODULES = [{
  id: "2",
  title: "Important Documents",
  description: "Keep copies of vital documents accessible. View saved images and file metadata here.",
  checklistItems: [],
  icon: "file-document"
}, {
  id: "1",
  title: "Post-shaking Checklist",
  description: "Keep yourself safe after an earthquake.",
  checklistItems: [{
    id: 1,
    text: "Check yourself and others for injuries.",
    completed: false
  }, {
    id: 2,
    text: "Be prepared for aftershocks.",
    completed: false
  }, {
    id: 3,
    text: "Inspect your home for structural damage and hazards (gas, water, electric).",
    completed: false
  }, {
    id: 4,
    text: "Turn off utilities if you suspect leaks or damage.",
    completed: false
  }, {
    id: 5,
    text: "Listen to emergency broadcasts for updates and instructions.",
    completed: false
  }, {
    id: 6,
    text: "Limit phone use to emergencies only.",
    completed: false
  }, {
    id: 7,
    text: "Stay away from damaged buildings and areas.",
    completed: false
  }, {
    id: 8,
    text: "Wear sturdy shoes and protective clothing if you must go outside.",
    completed: false
  }, {
    id: 9,
    text: "Check for fires and extinguish if safe to do so.",
    completed: false
  }, {
    id: 10,
    text: "Help neighbors who may require special assistance.",
    completed: false
  }]
}];
export default function Emergency() {
  const navigation = useNavigation();
  const { palette } = useTheme();
  const [expandedModule, setExpandedModule] = useState(null);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [medicalList, setMedicalList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const EmergencyContactsList = ({
    contacts
  }) => {
    let list = contacts ?? emergencyContacts;
    if (!list || Array.isArray(list) && list.length === 0) {
      return <View className={"items-center p-[40px]"}>
          <AppIcon name="account-alert" size={48} color={palette.mutedForeground} />
          <Text className={"text-muted-foreground text-[16px] text-center mt-[12px]"}>
            No emergency contacts saved.
          </Text>
        </View>;
    }
    if (!Array.isArray(list)) list = [list];
    return <View className={"gap-[12px]"}>
        {list.map((c, idx) => {
        const name = c.name || c.raw?.name || "Unnamed";
        const phone = c.phone || c.contact || c.raw?.phone || c.raw?.contact || "-";
        const relation = c.relation || c.raw?.relation || c.raw?.rel || "";
        return <View key={idx} className={"flex-row items-center bg-muted rounded-[12px] p-[16px] border border-border"}>
              <View className={"w-[40px] h-[40px] rounded-[20px] justify-center items-center mr-[12px]"}>
                <AppIcon name="account" size={20} color={palette.primary} />
              </View>
              <View className={"flex-1"}>
                <Text className={"font-semibold text-[16px] text-secondary-foreground mb-[2px]"}>{name}</Text>
                <Text className={"text-muted-foreground text-[14px]"}>
                  {relation ? `${relation} • ${phone}` : `${phone}`}
                </Text>
              </View>
              <Button unstyled className={"p-[8px]"}>
                <AppIcon name="phone" size={18} color={palette.primary} />
              </Button>
            </View>;
      })}
      </View>;
  };

  // Renders medical info
  const MedicalInfoList = ({
    medicalList: medicalListProp
  }) => {
    let list = medicalListProp ?? medicalList;
    if (typeof list === "string") {
      return <View>
          {list.map((m, idx) => {
          const title = m.name || m.raw?.name || "Medical Record";
          let nested = null;
          if (typeof m.notes === "string") {
            try {
              const parsed = JSON.parse(m.notes);
              if (Array.isArray(parsed)) nested = parsed;
            } catch (_e) {}
          }
          return <View key={idx} className={"bg-muted rounded-[12px] p-[16px] border border-border"}>
                <View className={"flex-row items-center mb-[12px]"}>
                  <AppIcon name="medical-bag" size={20} color={palette.destructive} />
                  <Text className={"font-semibold text-[16px] text-secondary-foreground ml-[8px]"}>{title}</Text>
                </View>
                <View className={"gap-[8px]"}>
                  {m.medications && <View className={"flex-row justify-between items-start"}>
                      <Text className={"font-medium text-muted-foreground text-[14px] w-[30%]"}>Medications</Text>
                      <Text className={"flex-1 text-secondary-foreground text-[14px] text-right"}>{m.medications}</Text>
                    </View>}
                  {m.allergies && <View className={"flex-row justify-between items-start"}>
                      <Text className={"font-medium text-muted-foreground text-[14px] w-[30%]"}>Allergies</Text>
                      <Text className={"flex-1 text-secondary-foreground text-[14px] text-right"}>{m.allergies}</Text>
                    </View>}
                  {m.bloodType && <View className={"flex-row justify-between items-start"}>
                      <Text className={"font-medium text-muted-foreground text-[14px] w-[30%]"}>Blood Type</Text>
                      <Text className={"flex-1 text-secondary-foreground text-[14px] text-right"}>{m.bloodType}</Text>
                    </View>}

                  {nested ? <View className="mt-[12px]">
                      {nested.map((n, i) => <View key={i} className={"bg-[rgba(255,255,255,0.7)] rounded-[8px] p-[12px] mb-[8px]"}>
                          <Text className={"font-semibold text-secondary-foreground mb-[4px]"}>
                            {n.name || "Medical Record"}
                          </Text>
                          {n.medications && <Text className={"text-muted-foreground text-[13px] mb-[2px]"}>
                              Medications: {n.medications}
                            </Text>}
                          {n.allergies && <Text className={"text-muted-foreground text-[13px] mb-[2px]"}>
                              Allergies: {n.allergies}
                            </Text>}
                          {n.bloodType && <Text className={"text-muted-foreground text-[13px] mb-[2px]"}>
                              Blood Type: {n.bloodType}
                            </Text>}
                          {n.notes && <Text className={"text-muted-foreground text-[13px] mb-[2px]"}>{n.notes}</Text>}
                        </View>)}
                    </View> : m.notes && <View className={"flex-row justify-between items-start"}>
                        <Text className={"font-medium text-muted-foreground text-[14px] w-[30%]"}>Notes</Text>
                        <Text className={"flex-1 text-secondary-foreground text-[14px] text-right"}>{m.notes}</Text>
                      </View>}
                </View>
              </View>;
        })}
        </View>;
    }
    if (!Array.isArray(list)) list = [list];
    if (list.length === 0) {
      return <View className={"items-center p-[40px]"}>
          <AppIcon name="medical-bag" size={48} color={palette.mutedForeground} />
          <Text className={"text-muted-foreground text-[16px] text-center mt-[12px]"}>
            No medical information saved.
          </Text>
        </View>;
    }
    return <View className={"gap-[16px]"}>
        {list.map((m, idx) => <View key={idx} className={"bg-muted rounded-[12px] p-[16px] border border-border"}>
            <View className={"flex-row items-center mb-[12px]"}>
              <AppIcon name="medical-bag" size={20} color={palette.destructive} />
              <Text className={"font-semibold text-[16px] text-secondary-foreground ml-[8px]"}>
                {m.name || m.raw?.name || "Medical Record"}
              </Text>
            </View>
            <View className={"gap-[8px]"}>
              {m.medications && <View className={"flex-row justify-between items-start"}>
                  <Text className={"font-medium text-muted-foreground text-[14px] w-[30%]"}>Medications</Text>
                  <Text className={"flex-1 text-secondary-foreground text-[14px] text-right"}>{m.medications}</Text>
                </View>}
              {m.allergies && <View className={"flex-row justify-between items-start"}>
                  <Text className={"font-medium text-muted-foreground text-[14px] w-[30%]"}>Allergies</Text>
                  <Text className={"flex-1 text-secondary-foreground text-[14px] text-right"}>{m.allergies}</Text>
                </View>}
              {m.bloodType && <View className={"flex-row justify-between items-start"}>
                  <Text className={"font-medium text-muted-foreground text-[14px] w-[30%]"}>Blood Type</Text>
                  <Text className={"flex-1 text-secondary-foreground text-[14px] text-right"}>{m.bloodType}</Text>
                </View>}
              {m.notes && <View className={"flex-row justify-between items-start"}>
                  <Text className={"font-medium text-muted-foreground text-[14px] w-[30%]"}>Notes</Text>
                  <Text className={"flex-1 text-secondary-foreground text-[14px] text-right"}>{m.notes}</Text>
                </View>}
            </View>
          </View>)}
      </View>;
  };

  // Load data from async storage
  const loadEmergencyData = async () => {
    try {
      setLoadError(null);
      const stateRaw = (await AsyncStorage.getItem("emergencyState")) || (await getData("emergencyState")) || "no";
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
            contacts = [{
              name: null,
              contact: contactsRaw
            }];
          }
        } else if (Array.isArray(contactsRaw)) {
          contacts = contactsRaw;
        } else if (typeof contactsRaw === "object") {
          contacts = [contactsRaw];
        }
      }
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
        console.warn("Emergency: failed to read medical_info from AsyncStorage", e);
        med = [];
      }
      med = med.map(m => {
        if (!m) return null;
        if (typeof m === "string") return {
          id: null,
          name: null,
          notes: m,
          medications: null,
          allergies: null,
          bloodType: null,
          raw: m
        };
        return {
          id: m.id || m._id || null,
          name: m.name || m.fullName || null,
          medications: m.medications || m.Medications || m.meds || null,
          allergies: m.allergies || m.Allergies || null,
          bloodType: m.bloodType || m.BloodType || m.blood || null,
          notes: m.notes || m.Notes || null,
          raw: m
        };
      }).filter(Boolean);
      setMedicalList(med);
      let docs = [];
      const docsRaw = (await AsyncStorage.getItem("important_documents")) || (await AsyncStorage.getItem("importantDocuments"));
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
      setLoadError("Saved emergency information could not be loaded.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadEmergencyData();
  }, []);
  useFocusEffect(useCallback(() => {
    loadEmergencyData();
  }, []));
  const FoodWater = () => <ScrollView className={"flex-1"}>
      <View className={"gap-[16px]"}>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• Store 1 gallon of water per person per day (for at least 3 days).</Text>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• Keep non-perishable food like canned goods, protein bars, and dried fruit.</Text>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• Have a manual can opener and disposable utensils.</Text>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• Replace food and water every 6 months.</Text>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• If tap water is unsafe, boil it or use purification tablets.</Text>
      </View>
    </ScrollView>;
  const Aftershocks = () => <ScrollView className={"flex-1"}>
      <View className={"gap-[16px]"}>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• Expect more shaking after the main earthquake.</Text>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• Drop, Cover, and Hold On during each aftershock.</Text>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• Stay away from damaged buildings, walls, and power lines.</Text>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• Check for gas leaks or fires before re-entering any area.</Text>
        <Text className={"text-[15px] text-secondary-foreground leading-[22px]"}>• Listen to local alerts and contact family when safe.</Text>
      </View>
    </ScrollView>;
  const emergencyCards = [{
    id: "1",
    title: "Emergency Contacts",
    icon: "phone",
    component: EmergencyContactsList
  }, {
    id: "2",
    title: "Medical Info",
    icon: "clipboard-pulse",
    component: MedicalInfoList
  }, {
    id: "3",
    title: "Food & Water",
    icon: "water",
    component: FoodWater
  }, {
    id: "4",
    title: "Aftershocks",
    icon: "home-alert",
    component: Aftershocks
  }];
  const toggleModule = moduleId => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };
  const ModuleCard = ({
    module
  }) => {
    const isExpanded = expandedModule === module.id;
    const [checklist, setChecklist] = useState(Array.isArray(module.checklistItems) ? module.checklistItems : []);
    const toggleItem = itemId => {
      const updatedChecklist = checklist.map(item => item.id === itemId ? {
        ...item,
        completed: !item.completed
      } : item);
      setChecklist(updatedChecklist);
    };
    return <View className={[["bg-card rounded-[16px] shadow-sm border border-border overflow-hidden"].filter(Boolean).join(" "), "rounded-[16px] mb-[12px] shadow-sm border border-border overflow-hidden"].filter(Boolean).join(" ")}>
        <Button unstyled className={[["flex-row items-center justify-between p-[18px]"].filter(Boolean).join(" "), "py-[20px] px-[20px]"].filter(Boolean).join(" ")} onPress={() => toggleModule(module.id)} activeOpacity={0.7}>
          <View className={"flex-row items-center flex-1"}>
            <View className={"flex-1"}>
              <Text className={[["text-base font-semibold text-secondary-foreground mb-[2px]"].filter(Boolean).join(" "), "text-[18px] font-bold text-secondary-foreground mb-[4px]"].filter(Boolean).join(" ")}>
                {module.title}
              </Text>
              <Text className={["text-[14px] leading-[20px]"].filter(Boolean).join(" ")}>
                {module.description}
              </Text>
            </View>
          </View>
          <View className={"items-end gap-[4px]"}>
            <AppIcon name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={palette.primary} />
          </View>
        </Button>

        {isExpanded && <View className={"border-t border-border p-[18px]"}>
            {module.title && module.title.toLowerCase().includes("important") ? <View className={"gap-[12px]"}>
                {documents && documents.length > 0 ? documents.map((d, i) => {
            const uri = d.uri || d.path || d.raw?.uri;
            const isImage = typeof uri === "string" && /\.(jpe?g|png|gif|bmp|webp|heic|heif)$/i.test(uri);
            return <View key={d.id || uri || i} className={"flex-row items-center bg-muted rounded-[12px] p-[16px] border border-border"}>
                        {isImage && <Image source={{
                uri
              }} className={"w-[50px] h-[50px] rounded-[8px] mr-[12px] bg-muted"} />}
                        <View className={"flex-1"}>
                          <Text className={"font-semibold text-[15px] text-secondary-foreground mb-[2px]"}>
                            {d.title || d.fileName || uri || "Document"}
                          </Text>
                          <Text className={"text-muted-foreground text-[13px]"}>
                            {d.fileName || uri}
                          </Text>
                        </View>
                        <Button unstyled className={"p-[8px]"}>
                          <AppIcon name="download" size={18} color={palette.primary} />
                        </Button>
                      </View>;
          }) : <View className={"items-center p-[40px]"}>
                    <AppIcon name="file-document" size={48} color={palette.mutedForeground} />
                    <Text className={"text-muted-foreground text-[16px] text-center mt-[12px]"}>
                      No important documents saved.
                    </Text>
                  </View>}
              </View> : module.title && module.title.toLowerCase().includes("medical") ? <View className={"gap-[16px]"}>
                <MedicalInfoList />
              </View> : <View className={"mb-[8px] bg-muted rounded-[12px] p-[4px]"}>
                {checklist.map(item => <Button unstyled key={item.id} className={["flex-row items-start py-[16px] px-[16px] bg-card rounded-[12px] mb-[8px] border-[1.5px] border-border shadow-sm", item.completed && "bg-secondary"].filter(Boolean).join(" ")} onPress={() => toggleItem(item.id)} activeOpacity={0.7}>
                    <View className={"flex-row items-start flex-1"}>
                      <View className={["w-[24px] h-[24px] rounded-[6px] border-[2px] border-muted-foreground justify-center items-center mr-[16px] bg-card", item.completed && "bg-primary border-primary"].filter(Boolean).join(" ")}>
                        {item.completed && <AppIcon name="check" size={16} color={palette.primaryForeground} />}
                      </View>
                      <Text className={["text-[15px] text-secondary-foreground flex-1 leading-[22px] font-medium", item.completed && "text-muted-foreground line-through"].filter(Boolean).join(" ")}>
                        {item.text}
                      </Text>
                    </View>
                  </Button>)}
              </View>}
          </View>}
      </View>;
  };
  const ModuleCardSquare = ({
    module
  }) => {
    const [visible, setVisible] = useState(false);
    const statusColor = palette.primary;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const contentScale = useRef(new Animated.Value(0.9)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const openModal = () => {
      setVisible(true);
      Animated.parallel([Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }), Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }), Animated.spring(contentScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true
      })]).start();
    };
    const closeModal = () => {
      Animated.parallel([Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }), Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }), Animated.timing(contentScale, {
        toValue: 0.9,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      })]).start(() => setVisible(false));
    };
    return <>
        <Button unstyled className={["w-[50%] aspect-[1] p-[6px]"].filter(Boolean).join(" ")} activeOpacity={0.85} onPress={openModal}>
          <View className={"bg-card rounded-[18px] p-[20px] flex-1 justify-center items-center shadow-sm border border-border"}>
            <View className={["w-[60px] h-[60px] rounded-[18px] justify-center items-center mb-[12px]"].filter(Boolean).join(" ")} style={{
            backgroundColor: `${statusColor}15`
          }}>
              <AppIcon name={module.icon} size={36}
            color={statusColor} />
            </View>
            <Text className={"text-[14px] font-semibold text-secondary-foreground text-center leading-[18px]"}>
              {module.title}
            </Text>
          </View>
        </Button>
        <Modal visible={visible} animationType="none" transparent={true} onRequestClose={closeModal} statusBarTranslucent={true}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View className={"flex-1 bg-[rgba(0,0,0,0.6)] justify-center items-center p-[20px]"} style={{
            opacity: backdropOpacity
          }}>
              <TouchableWithoutFeedback>
                <Animated.View className={"bg-card rounded-[20px] p-[24px] w-[100%] max-w-[500px] max-h-[80%] shadow-sm"} style={{
                opacity: contentOpacity,
                transform: [{
                  scale: contentScale
                }]
              }}>
                  <Button unstyled className={"absolute top-[16px] right-[16px] z-[10] p-[4px]"} onPress={closeModal}>
                    <AppIcon name="close" size={24} color={palette.mutedForeground} />
                  </Button>
                  <View className={"items-center mb-[20px] pt-[8px]"}>
                    <View className={"w-[64px] h-[64px] rounded-[20px] justify-center items-center mb-[12px]"}>
                      <AppIcon name={module.icon} size={40}
                    color={statusColor} />
                    </View>
                    <Text className={"font-bold text-[24px] text-secondary-foreground text-center"}>
                      {module.title}
                    </Text>
                  </View>
                  <View className={"w-[100%] max-h-[400px]"}>
                    {(() => {
                    const Comp = module.component;
                    if (typeof Comp === "function") {
                      return <ScrollView className={"w-[100%] max-h-[400px]"} contentContainerClassName="pb-[12px]" showsVerticalScrollIndicator>
                            <Comp contacts={emergencyContacts} medicalList={medicalList} documents={documents} />
                          </ScrollView>;
                    }
                    return <View className={"w-[100%] max-h-[400px]"}>{Comp || null}</View>;
                  })()}
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      </>;
  };
  if (loading) {
    return showSkeleton ? <ScreenSkeleton cards={4} /> : <View className="flex-1 bg-background" />;
  }
  if (loadError) {
    return (
      <View className="flex-1 justify-center bg-background p-5">
        <StatusCard tone="danger" title="Emergency information unavailable" description={loadError} />
      </View>
    );
  }
  return <ScrollView className={"flex-1 bg-background"} contentContainerClassName={"gap-[24px] px-[20px] pb-[32px] pt-[24px]"} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
      <PageHeader
        title="Emergency hub"
        description="Critical contacts, medical details, supplies, and post-shaking guidance in one place."
      />

      {emergencyActive && <View className={"bg-destructive rounded-[18px] py-[16px] px-[16px] mb-[20px] gap-[10px] shadow-sm"}>
          <View className={"flex-1 min-w-0 pr-[12px] items-start"}>
            <Text className={"text-primary-foreground text-[18px] font-extrabold mb-[2px] shrink flex-wrap text-left"}>
              EARTHQUAKE — DROP, COVER, HOLD ON
            </Text>
            <Text className={"text-[rgba(255,255,255,0.92)] text-[14px] leading-[20px] shrink text-left"}>
              An earthquake has been detected near you. Move to safe cover now.
            </Text>
          </View>
          <Button unstyled className={"bg-card py-[8px] px-[12px] rounded-[12px] ml-[12px] self-center shrink-0"} onPress={() => navigation.navigate("LocalRisk")}>
            <Text className={"text-destructive font-bold text-[13px]"}>
              View Current Earthquakes
            </Text>
          </Button>
        </View>}

      {/* Quick Actions Grid */}
      <View className={"gap-[12px]"}>
        <SectionHeader title="Quick access" description="Open essential information without leaving this screen." />
        <View className="flex-row flex-wrap">
        {emergencyCards.map(module => <ModuleCardSquare key={module.id} module={module} />)}
        </View>
      </View>

      {/* Emergency Checklists */}
      <View className={"gap-[12px]"}>
        <SectionHeader title="After an earthquake" description="Follow these steps once the shaking stops." />
        {EMERGENCY_MODULES.map(module => <ModuleCard key={module.id} module={module} />)}
      </View>
    </ScrollView>;
}
