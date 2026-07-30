import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "../../components/app-icon";
import { PageHeader, StatusCard } from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { getData } from "../../lib/storage/storageUtils";
import { useTheme } from "../../lib/theme";

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
  checklist: "After the shaking stops",
  aftershocks: "During aftershocks",
  supplies: "Food and water",
};

function EmptyState({ icon, children }) {
  const { palette } = useTheme();

  return (
    <View className="items-center gap-3 px-5 py-8">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <AppIcon name={icon} size={24} color={palette.mutedForeground} />
      </View>
      <Text className="text-center text-[15px] leading-5 text-muted-foreground">
        {children}
      </Text>
    </View>
  );
}

function InformationList({ items }) {
  return (
    <View className="w-full gap-4">
      {items.map((item, index) => (
        <View key={index} className="flex-row items-start gap-3">
          <View className="mt-[8px] h-2 w-2 rounded-full bg-primary" />
          <Text className="flex-1 text-[16px] leading-6 text-foreground">
            {item}
          </Text>
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
              ? "text-[19px] leading-6 text-foreground"
              : isWide
                ? "text-[19px] leading-6 text-foreground"
                : "text-[17px] leading-[22px] text-foreground",
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
  const dialogWidth = Math.max(280, Math.min(width - 32, 520));
  const dialogMaxHeight = Math.min(
    height - insets.top - insets.bottom - 32,
    720
  );

  return (
    <Modal
      visible={Boolean(activeCard)}
      transparent
      animationType="fade"
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
          className="overflow-hidden rounded-2xl border border-border bg-card"
          style={{
            width: dialogWidth,
            maxHeight: dialogMaxHeight,
            borderCurve: "continuous",
          }}
          onPress={(event) => event.stopPropagation()}
        >
          <View className="min-h-[64px] flex-row items-center border-b border-border px-5 py-4">
            <Text className="min-w-0 flex-1 pr-3 text-[22px] font-bold leading-7 text-foreground">
              {activeCard?.title || ""}
            </Text>
            <Button
              unstyled
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
              onPress={() => onOpenChange(false)}
              accessibilityLabel="Close popup"
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

function EmergencyContactsList({ contacts }) {
  const { palette } = useTheme();

  if (!contacts.length) {
    return (
      <EmptyState icon="account-alert">
        No emergency contacts saved.
      </EmptyState>
    );
  }

  return (
    <View className="w-full gap-3">
      {contacts.map((contact, index) => {
        const name = contact.name || contact.raw?.name || "Unnamed";
        const phone =
          contact.phone ||
          contact.contact ||
          contact.raw?.phone ||
          contact.raw?.contact ||
          "No phone number";
        const relation =
          contact.relation || contact.raw?.relation || contact.raw?.rel || "";

        return (
          <View
            key={contact.id || index}
            className="min-h-[72px] flex-row items-center gap-3 rounded-xl bg-muted p-4"
            style={{ borderCurve: "continuous" }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-card">
              <AppIcon name="account" size={20} color={palette.primary} />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-[16px] font-bold text-foreground">
                {name}
              </Text>
              {relation ? (
                <Text className="text-[14px] text-muted-foreground">
                  {relation}
                </Text>
              ) : null}
              <Text
                selectable
                className="text-[16px] font-semibold text-primary"
              >
                {phone}
              </Text>
            </View>
            <AppIcon name="phone" size={21} color={palette.primary} />
          </View>
        );
      })}
    </View>
  );
}

function MedicalInfoList({ medicalList }) {
  const { palette } = useTheme();

  if (!medicalList.length) {
    return (
      <EmptyState icon="medical-bag">
        No medical information saved.
      </EmptyState>
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
              <Text className="flex-1 text-[17px] font-bold text-foreground">
                {record.name || record.raw?.name || "Medical record"}
              </Text>
            </View>
            {details.length ? (
              <View className="gap-4">
                {details.map(([label, value]) => (
                  <View key={label} className="gap-1">
                    <Text className="text-[13px] font-semibold uppercase text-muted-foreground">
                      {label}
                    </Text>
                    <Text
                      selectable
                      className="text-[16px] leading-6 text-foreground"
                    >
                      {String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-[15px] text-muted-foreground">
                No details saved.
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function DocumentsList({ documents }) {
  const { palette } = useTheme();

  if (!documents.length) {
    return (
      <EmptyState icon="file-document">
        No important documents saved.
      </EmptyState>
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
              className="min-w-0 flex-1 text-[16px] font-semibold leading-5 text-foreground"
            >
              {document.title || document.fileName || uri || "Document"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function Checklist({ items, onToggle }) {
  const { palette } = useTheme();

  return (
    <View className="w-full gap-3">
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
          <View
            className={[
              "mt-[1px] h-6 w-6 items-center justify-center rounded-md border-2 border-muted-foreground bg-card",
              item.completed && "border-primary bg-primary",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {item.completed ? (
              <AppIcon
                name="check"
                size={16}
                color={palette.primaryForeground}
              />
            ) : null}
          </View>
          <Text
            className={[
              "flex-1 text-[16px] font-medium leading-6 text-foreground",
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

export default function Emergency() {
  const navigation = useNavigation();
  const [activeCardId, setActiveCardId] = useState(null);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [medicalList, setMedicalList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [checklist, setChecklist] = useState(POST_SHAKING_STEPS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);

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

  const toggleChecklistItem = (id) => {
    setChecklist((current) =>
      current.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  if (loading) {
    return showSkeleton ? (
      <ScreenSkeleton cards={5} />
    ) : (
      <View className="flex-1 bg-background" />
    );
  }

  if (loadError) {
    return (
      <View className="flex-1 justify-center bg-background p-5">
        <StatusCard
          tone="danger"
          title="Emergency information unavailable"
          description={loadError}
        />
      </View>
    );
  }

  const activeCard = activeCardId
    ? { id: activeCardId, title: CARD_TITLES[activeCardId] }
    : null;

  const activeCardContent = {
    contacts: <EmergencyContactsList contacts={emergencyContacts} />,
    medical: <MedicalInfoList medicalList={medicalList} />,
    documents: <DocumentsList documents={documents} />,
    checklist: (
      <Checklist items={checklist} onToggle={toggleChecklistItem} />
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
      >
        <PageHeader title="Emergency hub" />

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
                <Text className="text-[20px] font-extrabold leading-6 text-destructive-foreground">
                  Earthquake detected
                </Text>
                <Text className="text-[17px] font-bold leading-6 text-destructive-foreground">
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
            className="text-[20px] font-bold leading-6 text-foreground"
          >
            Your information
          </Text>
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
            className="text-[20px] font-bold leading-6 text-foreground"
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
