import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APP_ICONS, AppIcon } from "../../components/app-icon";
import { EmptyState, ErrorState, PageHeader } from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import { CheckIndicator } from "../../components/ui/checkbox";
import {
  FLASHLIGHT_FAILURE_MESSAGES,
  useFlashlight,
} from "../../components/ui/flashlight";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { Text } from "../../components/ui/text";
import { useToast } from "../../components/ui/toast";
import {
  callNumber,
  EMERGENCY_SERVICES_NUMBER,
  isDialable,
} from "../../lib/contact";
import haptics from "../../lib/haptics";
import { getData } from "../../lib/storage/storageUtils";
import { useTheme } from "../../lib/theme";
import { useRefresh } from "../../hooks/useRefresh";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useModalAccessibility } from "../../hooks/useModalAccessibility";
import { useReduceMotion } from "../../hooks/useReduceMotion";
import { loadPlanSections } from "../../lib/plan";
import {
  LOCATION_FAILURE_MESSAGES,
  shareCurrentLocation,
} from "../../lib/shareLocation";

const POST_SHAKING_STEPS = [
  "Check yourself and others for injuries.",
  "Be prepared for aftershocks.",
  "Check the building for structural damage and hazards.",
  "Turn off utilities if you suspect a leak or damage.",
  "Listen to local emergency broadcasts.",
  "Limit phone use to emergencies.",
  "Stay away from damaged buildings and power lines.",
  "Wear sturdy shoes and protective clothing outside.",
  "Check for fires and extinguish them only if it is safe.",
  "Help neighbors who may need assistance.",
].map((text, index) => ({
  id: index + 1,
  text,
  completed: false,
}));

const FOOD_AND_WATER = [
  "Store 1 gallon of water per person per day for at least 3 days.",
  "Keep non-perishable food such as canned goods, protein bars, and dried fruit.",
  "Have a manual can opener and disposable utensils.",
  "Replace stored food and water every 6 months.",
  "If tap water is unsafe, boil it or use purification tablets.",
];

const AFTERSHOCKS = [
  "Expect more shaking after the main earthquake.",
  "Drop, Cover, and Hold On during each aftershock.",
  "Stay away from damaged buildings, walls, and power lines.",
  "Check for gas leaks or fires before re-entering any area.",
  "Listen to local alerts and contact family when safe.",
];

const CARD_TITLES = {
  contacts: "Emergency contacts",
  medical: "Medical information",
  documents: "Important documents",
  plan: "My emergency plan",
  checklist: "After the shaking stops",
  aftershocks: "During aftershocks",
  supplies: "Food and water",
};

const CHECKLIST_STORAGE_KEY = "emergency_post_shaking_checklist_v1";

function InformationList({ items }) {
  return (
    <View className="w-full gap-4">
      {items.map((item, index) => (
        <View key={index} className="flex-row items-start gap-3">
          <View className="mt-[8px] h-2 w-2 rounded-full bg-primary" />
          <Text className="flex-1 text-body-lg text-foreground">{item}</Text>
        </View>
      ))}
    </View>
  );
}

function EmergencyCard({
  title,
  icon,
  size = "standard",
  onPress,
}) {
  const { palette } = useTheme();
  const isPrimary = size === "primary";
  const isWide = size === "wide";

  return (
    <Button
      unstyled
      className={[
        "rounded-2xl border p-5 active:opacity-80",
        isPrimary
          ? "min-h-[164px] flex-1 flex-col items-start justify-between border-border bg-card"
          : isWide
            ? "min-h-[112px] w-full flex-row items-center gap-4 border-border bg-card"
            : "min-h-[148px] flex-1 basis-0 flex-col items-start justify-between border-border bg-card",
      ].join(" ")}
      style={{ borderCurve: "continuous" }}
      onPress={onPress}
      accessibilityLabel={`Open ${title}`}
    >
      <View
        className={[
          "items-center justify-center",
          isPrimary
            ? "h-14 w-14 rounded-2xl bg-secondary"
            : isWide
              ? "h-14 w-14 rounded-2xl bg-secondary"
              : "h-12 w-12 rounded-xl bg-secondary",
        ].join(" ")}
      >
        <AppIcon
          name={icon}
          size={isPrimary ? 28 : 24}
          color={palette.primary}
        />
      </View>

      <View className={isWide ? "min-w-0 flex-1" : "w-full"}>
        <Text
          className={[
            "font-bold",
            isPrimary
              ? "text-title-sm text-foreground"
              : isWide
                ? "text-title-sm text-foreground"
                : "text-callout text-foreground",
          ].join(" ")}
        >
          {title}
        </Text>
      </View>

      {isWide ? (
        <AppIcon
          name="chevron-right"
          size={22}
          color={palette.mutedForeground}
        />
      ) : null}
    </Button>
  );
}

function EmergencyDialog({ activeCard, onOpenChange, children }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const reduceMotion = useReduceMotion();
  const titleRef = useRef(null);
  useModalAccessibility(Boolean(activeCard), {
    title: activeCard?.title,
    focusRef: titleRef,
  });
  const dialogWidth = Math.max(280, Math.min(width - 32, 520));
  const dialogMaxHeight = Math.min(
    height - insets.top - insets.bottom - 32,
    720
  );

  return (
    <Modal
      visible={Boolean(activeCard)}
      transparent
      animationType={reduceMotion ? "none" : "fade"}
      statusBarTranslucent
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 px-4"
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
        }}
        onPress={() => onOpenChange(false)}
        accessibilityRole="button"
        accessibilityLabel="Close popup"
      >
        <Pressable
          accessibilityViewIsModal
          className="overflow-hidden rounded-2xl border border-border bg-card"
          style={{
            width: dialogWidth,
            maxHeight: dialogMaxHeight,
            borderCurve: "continuous",
          }}
          onPress={(event) => event.stopPropagation()}
        >
          <View className="min-h-[64px] flex-row items-center border-b border-border px-5 py-4">
            <Text
              ref={titleRef}
              accessible
              role="heading"
              aria-level={2}
              className="min-w-0 flex-1 pr-3 text-title-lg font-bold text-foreground"
            >
              {activeCard?.title || ""}
            </Text>
            <Button
              unstyled
              className="h-11 w-11 items-center justify-center rounded-full active:bg-muted"
              onPress={() => onOpenChange(false)}
              accessibilityLabel="Close popup"
              hitSlop={8}
            >
              <AppIcon
                name="close"
                size={22}
                color={palette.mutedForeground}
              />
            </Button>
          </View>
          <ScrollView
            className="w-full shrink"
            contentContainerStyle={{ padding: 20, width: "100%" }}
            showsVerticalScrollIndicator={false}
          >
            <View className="w-full">{children}</View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function EmergencyContactsList({ contacts, offline, onAdd, onCallFailed }) {
  const { palette } = useTheme();

  if (!contacts.length) {
    return (
      <EmptyState
        variant="plain"
        icon={APP_ICONS["account-alert"]}
        title={offline ? "Contacts couldn’t be loaded" : "No emergency contacts saved"}
        description={
          offline
            ? "You appear to be offline and no contacts are saved on this device yet. Reconnect to sync them."
            : "Add the people you would call first, so they are one tap away."
        }
        action={
          offline ? null : (
            <Button size="sm" onPress={onAdd}>
              Add a contact
            </Button>
          )
        }
      />
    );
  }

  return (
    <View className="w-full gap-3">
      {contacts.map((contact, index) => {
        const name = contact.name || contact.raw?.name || "Unnamed";
        const rawPhone =
          contact.phone ||
          contact.contact ||
          contact.raw?.phone ||
          contact.raw?.contact ||
          null;
        const relation =
          contact.relation || contact.raw?.relation || contact.raw?.rel || "";
        const dialable = isDialable(rawPhone);

        const body = (
          <>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-card">
              <AppIcon name="account" size={20} color={palette.primary} />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-body-lg font-bold text-foreground">
                {name}
              </Text>
              {relation ? (
                <Text className="text-body-sm text-muted-foreground">
                  {relation}
                </Text>
              ) : null}
              <Text
                selectable={!dialable}
                className="text-body-lg font-semibold text-primary"
              >
                {rawPhone || "No phone number"}
              </Text>
            </View>
            {dialable ? (
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
                <AppIcon
                  name="phone"
                  size={20}
                  color={palette.primaryForeground}
                />
              </View>
            ) : null}
          </>
        );

        if (!dialable) {
          return (
            <View
              key={contact.id || index}
              className="min-h-[72px] flex-row items-center gap-3 rounded-xl bg-muted p-4"
              style={{ borderCurve: "continuous" }}
            >
              {body}
            </View>
          );
        }

        return (
          <Button
            unstyled
            key={contact.id || index}
            className="min-h-[72px] w-full flex-row items-center gap-3 rounded-xl bg-muted p-4 active:opacity-80"
            style={{ borderCurve: "continuous" }}
            onPress={async () => {
              const started = await callNumber(rawPhone);
              if (!started) onCallFailed?.(name);
            }}
            accessibilityLabel={`Call ${name}${relation ? `, ${relation}` : ""}, ${rawPhone}`}
            accessibilityHint="Opens your phone app with this number ready to dial"
          >
            {body}
          </Button>
        );
      })}
    </View>
  );
}

function MedicalInfoList({ medicalList, offline, onAdd }) {
  const { palette } = useTheme();

  if (!medicalList.length) {
    return (
      <EmptyState
        variant="plain"
        icon={APP_ICONS["medical-bag"]}
        title={
          offline
            ? "Medical information couldn’t be loaded"
            : "No medical information saved"
        }
        description={
          offline
            ? "You appear to be offline and nothing is saved on this device yet. Reconnect to sync it."
            : "Allergies, medications and blood type are what responders ask for first."
        }
        action={
          offline ? null : (
            <Button size="sm" onPress={onAdd}>
              Add medical information
            </Button>
          )
        }
      />
    );
  }

  return (
    <View className="w-full gap-4">
      {medicalList.map((record, index) => {
        const details = [
          ["Medications", record.medications],
          ["Allergies", record.allergies],
          ["Blood type", record.bloodType],
          ["Notes", record.notes],
        ].filter(([, value]) => value);

        return (
          <View
            key={record.id || index}
            className="gap-4 rounded-xl bg-muted p-4"
            style={{ borderCurve: "continuous" }}
          >
            <View className="flex-row items-center gap-3">
              <AppIcon
                name="medical-bag"
                size={20}
                color={palette.destructive}
              />
              <Text className="flex-1 text-callout font-bold text-foreground">
                {record.name || record.raw?.name || "Medical record"}
              </Text>
            </View>
            {details.length ? (
              <View className="gap-4">
                {details.map(([label, value]) => (
                  <View key={label} className="gap-1">
                    <Text className="text-footnote font-semibold uppercase text-muted-foreground">
                      {label}
                    </Text>
                    <Text selectable className="text-body-lg text-foreground">
                      {String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-body text-muted-foreground">
                No details saved.
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function DocumentsList({ documents, onAdd }) {
  const { palette } = useTheme();

  if (!documents.length) {
    return (
      <EmptyState
        variant="plain"
        icon={APP_ICONS["file-document"]}
        title="No important documents saved"
        description="Photos of IDs, insurance policies and prescriptions are stored on this device and stay available offline."
        action={
          <Button size="sm" onPress={onAdd}>
            Add a document
          </Button>
        }
      />
    );
  }

  return (
    <View className="w-full gap-3">
      {documents.map((document, index) => {
        const uri = document.uri || document.path || document.raw?.uri;
        const isImage =
          typeof uri === "string" &&
          /\.(jpe?g|png|gif|bmp|webp|heic|heif)$/i.test(uri);

        return (
          <View
            key={document.id || uri || index}
            className="min-h-[68px] flex-row items-center gap-3 rounded-xl bg-muted p-3"
            style={{ borderCurve: "continuous" }}
          >
            {isImage ? (
              <Image
                source={{ uri }}
                className="h-12 w-12 rounded-lg bg-card"
                accessibilityLabel=""
              />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-lg bg-card">
                <AppIcon
                  name="file-document"
                  size={22}
                  color={palette.primary}
                />
              </View>
            )}
            <Text
              selectable
              className="min-w-0 flex-1 text-body-lg font-semibold text-foreground"
            >
              {document.title || document.fileName || uri || "Document"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function PlanList({ sections, onEdit }) {
  if (!sections.length) {
    return (
      <EmptyState
        variant="plain"
        icon={APP_ICONS["clipboard-list"]}
        title="No plan written yet"
        description="Where you will meet, how you will get out, who does what. Writing it down now is what makes it usable later."
        action={
          <Button size="sm" onPress={onEdit}>
            Write my plan
          </Button>
        }
      />
    );
  }

  return (
    <View className="w-full gap-4">
      {sections.map((section) => (
        <View
          key={section.key}
          className="gap-2 rounded-xl bg-muted p-4"
          style={{ borderCurve: "continuous" }}
        >
          <Text className="text-footnote font-semibold uppercase text-muted-foreground">
            {section.title}
          </Text>
          <Text selectable className="text-body-lg text-foreground">
            {section.body}
          </Text>
        </View>
      ))}
      <Button variant="outline" onPress={onEdit}>
        Edit my plan
      </Button>
    </View>
  );
}

function Checklist({ items, onToggle, onReset }) {
  const completed = items.filter((item) => item.completed).length;

  return (
    <View className="w-full gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="text-footnote font-semibold text-muted-foreground"
          accessibilityLiveRegion="polite"
        >
          {completed} of {items.length} done
        </Text>
        {completed > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onPress={onReset}
            accessibilityLabel="Reset checklist"
            accessibilityHint="Clears every tick so the list is ready for the next earthquake"
          >
            <Text className="font-semibold text-primary">Reset</Text>
          </Button>
        ) : null}
      </View>

      {items.map((item) => (
        <Button
          unstyled
          key={item.id}
          className="min-h-[64px] w-full flex-row items-start gap-4 rounded-xl bg-muted px-4 py-4 active:opacity-80"
          onPress={() => onToggle(item.id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.completed }}
          accessibilityLabel={item.text}
        >
          <CheckIndicator checked={item.completed} className="mt-[1px]" />
          <Text
            className={[
              "flex-1 text-body-lg font-medium text-foreground",
              item.completed && "text-muted-foreground line-through",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {item.text}
          </Text>
        </Button>
      ))}
    </View>
  );
}

export default function Emergency({ route }) {
  const navigation = useNavigation();
  const { palette } = useTheme();
  const [activeCardId, setActiveCardId] = useState(null);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [medicalList, setMedicalList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [checklist, setChecklist] = useState(POST_SHAKING_STEPS);
  const [planSections, setPlanSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const toast = useToast();
  const { isOnline } = useOnlineStatus();

  const syncUnavailable = !isOnline;

  const loadEmergencyData = useCallback(async () => {
    try {
      setLoadError(null);
      const stateRaw =
        (await AsyncStorage.getItem("emergencyState")) ||
        (await getData("emergencyState")) ||
        "no";
      setEmergencyActive(String(stateRaw).toLowerCase() === "yes");

      let contactsRaw =
        (await AsyncStorage.getItem("emergency_contacts")) ||
        (await AsyncStorage.getItem("emergencyContacts")) ||
        (await getData("emergency_contacts")) ||
        (await getData("emergencyContacts"));
      let contacts = [];
      if (contactsRaw) {
        if (typeof contactsRaw === "string") {
          try {
            const parsed = JSON.parse(contactsRaw);
            contacts = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            contacts = [{ contact: contactsRaw }];
          }
        } else {
          contacts = Array.isArray(contactsRaw) ? contactsRaw : [contactsRaw];
        }
      }
      setEmergencyContacts(contacts);

      let medical = [];
      const medicalRaw = await AsyncStorage.getItem("medical_info");
      if (medicalRaw) {
        try {
          const parsed = JSON.parse(medicalRaw);
          medical = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          medical = [{ notes: medicalRaw }];
        }
      }
      setMedicalList(
        medical.filter(Boolean).map((record) => {
          if (typeof record === "string") {
            return { notes: record, raw: record };
          }
          return {
            id: record.id || record._id || null,
            name: record.name || record.fullName || null,
            medications:
              record.medications || record.Medications || record.meds || null,
            allergies: record.allergies || record.Allergies || null,
            bloodType:
              record.bloodType || record.BloodType || record.blood || null,
            notes: record.notes || record.Notes || null,
            raw: record,
          };
        })
      );

      const documentsRaw =
        (await AsyncStorage.getItem("important_documents")) ||
        (await AsyncStorage.getItem("importantDocuments"));
      if (documentsRaw) {
        try {
          const parsed = JSON.parse(documentsRaw);
          setDocuments(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          setDocuments([{ title: documentsRaw }]);
        }
      } else {
        setDocuments([]);
      }

      setPlanSections(await loadPlanSections());

      try {
        const savedChecklist = await AsyncStorage.getItem(
          CHECKLIST_STORAGE_KEY
        );
        const completedIds = savedChecklist ? JSON.parse(savedChecklist) : [];
        if (Array.isArray(completedIds)) {
          setChecklist(
            POST_SHAKING_STEPS.map((item) => ({
              ...item,
              completed: completedIds.includes(item.id),
            }))
          );
        }
      } catch (error) {
        console.warn("Emergency: failed to restore checklist", error);
      }
    } catch (error) {
      console.warn("Emergency: failed to load emergency data", error);
      setLoadError("Saved emergency information could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmergencyData();
  }, [loadEmergencyData]);

  useFocusEffect(
    useCallback(() => {
      loadEmergencyData();
    }, [loadEmergencyData])
  );

  const { refreshing, onRefresh } = useRefresh(loadEmergencyData);

  const requestedCard = route?.params?.card;
  useEffect(() => {
    if (requestedCard && CARD_TITLES[requestedCard]) {
      setActiveCardId(requestedCard);
      navigation.setParams({ card: undefined });
    }
  }, [requestedCard, navigation]);

  const persistChecklist = useCallback(async (items) => {
    try {
      await AsyncStorage.setItem(
        CHECKLIST_STORAGE_KEY,
        JSON.stringify(items.filter((i) => i.completed).map((i) => i.id))
      );
    } catch (error) {
      console.warn("Emergency: failed to persist checklist", error);
    }
  }, []);

  const toggleChecklistItem = useCallback(
    (id) => {
      haptics.selection();
      setChecklist((current) => {
        const next = current.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        );
        persistChecklist(next);
        return next;
      });
    },
    [persistChecklist]
  );

  const resetChecklist = useCallback(() => {
    haptics.light();
    const next = POST_SHAKING_STEPS.map((item) => ({
      ...item,
      completed: false,
    }));
    setChecklist(next);
    persistChecklist(next);
  }, [persistChecklist]);

  const callEmergencyServices = useCallback(async () => {
    const started = await callNumber(EMERGENCY_SERVICES_NUMBER);
    if (!started) {
      toast.error("Couldn’t open the dialer", {
        description: `Dial ${EMERGENCY_SERVICES_NUMBER} directly from your phone app.`,
      });
    }
  }, [toast]);

  const [sharingLocation, setSharingLocation] = useState(false);
  const { on: torchOn, toggle: toggleTorch } = useFlashlight();

  const handleFlashlight = useCallback(async () => {
    haptics.light();
    const result = await toggleTorch();
    if (!result.ok) {
      const message =
        FLASHLIGHT_FAILURE_MESSAGES[result.reason] ||
        FLASHLIGHT_FAILURE_MESSAGES.denied;
      toast.error(message.title, { description: message.description });
    }
  }, [toggleTorch, toast]);

  const shareLocation = useCallback(async () => {
    setSharingLocation(true);
    try {
      const result = await shareCurrentLocation();
      if (!result.ok) {
        const message =
          LOCATION_FAILURE_MESSAGES[result.reason] ||
          LOCATION_FAILURE_MESSAGES.unavailable;
        toast.error(message.title, { description: message.description });
      }
    } finally {
      setSharingLocation(false);
    }
  }, [toast]);

  const handleCallFailed = useCallback(
    (name) => {
      toast.error(`Couldn’t call ${name}`, {
        description: "Your device wouldn’t open the dialer for that number.",
      });
    },
    [toast]
  );

  if (loading) {
    return showSkeleton ? (
      <ScreenSkeleton cards={5} />
    ) : (
      <View className="flex-1 bg-background" />
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Emergency information unavailable"
        description={loadError}
        onRetry={loadEmergencyData}
      />
    );
  }

  const activeCard = activeCardId
    ? { id: activeCardId, title: CARD_TITLES[activeCardId] }
    : null;

  const goTo = (route) => {
    setActiveCardId(null);
    navigation.navigate(route);
  };

  const activeCardContent = {
    contacts: (
      <EmergencyContactsList
        contacts={emergencyContacts}
        offline={syncUnavailable}
        onAdd={() => goTo("ContactInfo")}
        onCallFailed={handleCallFailed}
      />
    ),
    medical: (
      <MedicalInfoList
        medicalList={medicalList}
        offline={syncUnavailable}
        onAdd={() => goTo("MedicalInfo")}
      />
    ),
    documents: (
      <DocumentsList
        documents={documents}
        onAdd={() => goTo("ImportantDocuments")}
      />
    ),
    plan: <PlanList sections={planSections} onEdit={() => goTo("MyPlan")} />,
    checklist: (
      <Checklist
        items={checklist}
        onToggle={toggleChecklistItem}
        onReset={resetChecklist}
      />
    ),
    aftershocks: <InformationList items={AFTERSHOCKS} />,
    supplies: <InformationList items={FOOD_AND_WATER} />,
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-8 px-5 pb-10 pt-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      >
        <PageHeader title="Emergency hub" />

        <Button
          size="lg"
          variant="destructive"
          className="min-h-[60px] gap-3"
          onPress={callEmergencyServices}
          accessibilityLabel={`Call emergency services on ${EMERGENCY_SERVICES_NUMBER}`}
          accessibilityHint="Opens your phone app ready to dial"
        >
          <AppIcon name="phone" size={22} color="#FFFFFF" />
          <Text className="text-title-sm font-extrabold text-white">
            Call {EMERGENCY_SERVICES_NUMBER}
          </Text>
        </Button>

        <View className="-mt-4 flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            className="min-h-14 flex-1 gap-2 px-3"
            onPress={shareLocation}
            loading={sharingLocation}
            accessibilityLabel="Share my location"
            accessibilityHint="Opens the share sheet with your coordinates and a map link"
          >
            <AppIcon name="map-marker-radius" size={19} className="text-primary" />
            <Text className="text-body-sm font-bold text-primary">
              Share location
            </Text>
          </Button>

          <Button
            variant={torchOn ? "default" : "outline"}
            size="lg"
            className="min-h-14 flex-1 gap-2 px-3"
            onPress={handleFlashlight}
            accessibilityRole="switch"
            accessibilityState={{ checked: torchOn }}
            accessibilityLabel={
              torchOn ? "Turn off flashlight" : "Turn on flashlight"
            }
            accessibilityHint="Uses the camera flash as a torch"
          >
            <AppIcon
              name="flashlight"
              size={19}
              color={torchOn ? palette.primaryForeground : palette.primary}
            />
            <Text
              className={
                torchOn
                  ? "text-body-sm font-bold text-primary-foreground"
                  : "text-body-sm font-bold text-primary"
              }
            >
              {torchOn ? "Light on" : "Flashlight"}
            </Text>
          </Button>
        </View>

        {emergencyActive ? (
          <View
            className="gap-5 rounded-2xl bg-destructive p-5"
            style={{ borderCurve: "continuous" }}
          >
            <View className="flex-row items-start gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <AppIcon name="alert-circle" size={24} color="#FFFFFF" />
              </View>
              <View className="min-w-0 flex-1 gap-2">
                <Text className="text-title font-extrabold text-destructive-foreground">
                  Earthquake detected
                </Text>
                <Text className="text-callout font-bold text-destructive-foreground">
                  Drop, Cover, and Hold On.
                </Text>
              </View>
            </View>
            <Button
              variant="secondary"
              size="lg"
              onPress={() => navigation.navigate("LocalRisk")}
              accessibilityLabel="View current earthquakes"
            >
              View current earthquakes
            </Button>
          </View>
        ) : null}

        <View className="gap-4">
          <Text
            role="heading"
            aria-level={2}
            className="text-title font-bold text-foreground"
          >
            Your information
          </Text>

          <EmergencyCard
            title={CARD_TITLES.plan}
            icon="clipboard-list"
            size="wide"
            onPress={() => setActiveCardId("plan")}
          />

          <View className="flex-row gap-4">
            <EmergencyCard
              title={CARD_TITLES.contacts}
              icon="phone"
              size="primary"
              onPress={() => setActiveCardId("contacts")}
            />
            <EmergencyCard
              title={CARD_TITLES.medical}
              icon="medical-bag"
              size="primary"
              onPress={() => setActiveCardId("medical")}
            />
          </View>
          <EmergencyCard
            title={CARD_TITLES.documents}
            icon="file-document"
            size="wide"
            onPress={() => setActiveCardId("documents")}
          />
        </View>

        <View className="gap-4">
          <Text
            role="heading"
            aria-level={2}
            className="text-title font-bold text-foreground"
          >
            What to do
          </Text>
          <EmergencyCard
            title={CARD_TITLES.checklist}
            icon="list-checks"
            size="wide"
            onPress={() => setActiveCardId("checklist")}
          />
          <View className="flex-row gap-4">
            <EmergencyCard
              title={CARD_TITLES.aftershocks}
              icon="home-alert"
              onPress={() => setActiveCardId("aftershocks")}
            />
            <EmergencyCard
              title={CARD_TITLES.supplies}
              icon="water"
              onPress={() => setActiveCardId("supplies")}
            />
          </View>
        </View>
      </ScrollView>

      <EmergencyDialog
        activeCard={activeCard}
        onOpenChange={(open) => {
          if (!open) setActiveCardId(null);
        }}
      >
        {activeCardId ? activeCardContent[activeCardId] : null}
      </EmergencyDialog>
    </>
  );
}
