import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { EmptyState, FormField, SectionCard } from "../../../components/app-ui";
import { AppIcon } from "../../../components/app-icon";
import {
  OnboardingHeading,
  OnboardingShell,
} from "../../../components/onboarding/OnboardingShell";
import { OnboardingSheet } from "../../../components/onboarding/OnboardingSheet";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Text } from "../../../components/ui/text";
import { useTheme } from "../../../lib/theme";
import { getData } from "../../../lib/storage/storageUtils";

const MED_KEY = "medical_info";
const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not sure",
];
const EMPTY = {
  name: "",
  bloodType: "",
  medications: "",
  allergies: "",
  notes: "",
};

/** Summary line for a saved record: blood type plus a medication count. */
const describe = (entry) => {
  const bits = [];
  if (entry.bloodType) bits.push(entry.bloodType);
  const meds = (entry.medications || "")
    .split(/[\n,]/)
    .map((m) => m.trim())
    .filter(Boolean);
  if (meds.length) {
    bits.push(`${meds.length} medication${meds.length === 1 ? "" : "s"}`);
  }
  if (entry.allergies?.trim()) bits.push("allergies noted");
  return bits.join(", ") || "No details yet";
};

export default function MedicalStep({
  stepIndex,
  stepCount,
  onBack,
  onSkip,
  onContinue,
}) {
  const { palette } = useTheme();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(MED_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        setEntries(Array.isArray(parsed) ? parsed : [parsed]);
      })
      .catch(() => {});
    getData("firstname")
      .then((val) => {
        if (mounted && val) setFirstName(String(val));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const openForm = () => {
    // Prefill the user's own name so the common case is "pick a blood type, save".
    setDraft({ ...EMPTY, name: entries.length === 0 ? firstName : "" });
    setShowForm(true);
  };

  const persist = async (next) => {
    setEntries(next);
    try {
      await AsyncStorage.setItem(MED_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("MedicalStep: could not save medical info", e);
    }
  };

  const saveDraft = async () => {
    const name = draft.name.trim();
    if (!name) return;
    await persist([
      ...entries,
      {
        id: `m_${Date.now()}`,
        name,
        medications: draft.medications.trim(),
        allergies: draft.allergies.trim(),
        bloodType: draft.bloodType === "Not sure" ? "" : draft.bloodType,
        notes: draft.notes.trim(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    setDraft(EMPTY);
    setShowForm(false);
  };

  const remove = (id) => persist(entries.filter((e) => e.id !== id));

  return (
    <OnboardingShell
      title="Medical info"
      stepIndex={stepIndex}
      stepCount={stepCount}
      onBack={onBack}
      onSkip={onSkip}
      onCta={onContinue}
      ctaLabel="Finish setup"
    >
      <OnboardingHeading
        icon="medical-bag"
        title="What should medics know?"
        description="Kept on your device and shown in the Emergency tab."
      />

      {entries.length === 0 ? (
        <EmptyState
          title="Nothing added yet"
          description="Blood type and allergies matter most."
        />
      ) : (
        <SectionCard className="overflow-hidden p-0">
          {entries.map((entry, index) => (
            <View
              key={entry.id}
              className={`min-h-16 flex-row items-center gap-3 px-4 py-3${
                index > 0 ? " border-t border-border" : ""
              }`}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-xl bg-secondary"
                style={{ borderCurve: "continuous" }}
              >
                <AppIcon name="medical-bag" size={20} color={palette.primary} />
              </View>
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="text-base font-semibold leading-5 text-foreground">
                  {entry.name}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-[13px] leading-[18px] text-muted-foreground"
                >
                  {describe(entry)}
                </Text>
              </View>
              <Button
                unstyled
                className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
                onPress={() => remove(entry.id)}
                accessibilityLabel={`Remove ${entry.name}`}
              >
                <AppIcon
                  name="trash-can-outline"
                  size={18}
                  color={palette.mutedForeground}
                />
              </Button>
            </View>
          ))}
        </SectionCard>
      )}

      <Button
        variant="outline"
        className="min-h-12 rounded-xl"
        onPress={openForm}
      >
        <AppIcon name="plus" size={18} color={palette.primary} />
        <Text className="font-semibold text-primary">
          {entries.length === 0 ? "Add medical details" : "Add someone else"}
        </Text>
      </Button>

      <View className="flex-1" />

      <OnboardingSheet
        visible={showForm}
        title="Medical details"
        submitLabel="Save"
        submitDisabled={!draft.name.trim()}
        onCancel={() => {
          setDraft(EMPTY);
          setShowForm(false);
        }}
        onSubmit={saveDraft}
      >
        <FormField label="Name">
          <Input
            className="h-12 py-0"
            placeholder="Who is this for?"
            value={draft.name}
            onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
            returnKeyType="next"
          />
        </FormField>

        <FormField label="Blood type">
          <View className="flex-row flex-wrap gap-2">
            {BLOOD_TYPES.map((type) => {
              const selected = draft.bloodType === type;
              return (
                <Button
                  unstyled
                  key={type}
                  className={`min-h-11 items-center justify-center rounded-full border px-4 py-2.5 ${
                    selected
                      ? "border-primary bg-primary"
                      : "border-border bg-secondary"
                  }`}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      bloodType: selected ? "" : type,
                    }))
                  }
                  accessibilityState={{ selected }}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? "text-primary-foreground" : "text-secondary-foreground"
                    }`}
                  >
                    {type}
                  </Text>
                </Button>
              );
            })}
          </View>
        </FormField>

        <FormField label="Allergies" description="Optional">
          <Textarea
            placeholder="Penicillin, peanuts"
            value={draft.allergies}
            onChangeText={(allergies) => setDraft((d) => ({ ...d, allergies }))}
          />
        </FormField>

        <FormField label="Medications" description="Optional">
          <Textarea
            placeholder="One per line"
            value={draft.medications}
            onChangeText={(medications) =>
              setDraft((d) => ({ ...d, medications }))
            }
          />
        </FormField>
      </OnboardingSheet>
    </OnboardingShell>
  );
}
