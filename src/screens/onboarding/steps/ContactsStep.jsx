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
import { Text } from "../../../components/ui/text";
import { useTheme } from "../../../lib/theme";

const STORAGE_KEY = "emergency_contacts";
const EMPTY = { name: "", phone: "", relation: "" };

export default function ContactsStep({
  stepIndex,
  stepCount,
  onBack,
  onSkip,
  onContinue,
}) {
  const { palette } = useTheme();
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(EMPTY);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setContacts(parsed);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const persist = async (next) => {
    setContacts(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("ContactsStep: could not save contacts", e);
    }
  };

  const saveDraft = async () => {
    const name = draft.name.trim();
    const phone = draft.phone.trim();
    if (!name || !phone) return;
    // The "c_" prefix is how ContactInfoScreen tells a local-only record from a
    // Firestore-backed one, so writing it here gets deferred sync for free.
    await persist([
      ...contacts,
      { id: `c_${Date.now()}`, name, phone, relation: draft.relation.trim() },
    ]);
    setDraft(EMPTY);
    setShowForm(false);
  };

  const remove = (id) => persist(contacts.filter((c) => c.id !== id));

  const canSave = !!draft.name.trim() && !!draft.phone.trim();

  return (
    <OnboardingShell
      title="Emergency contacts"
      stepIndex={stepIndex}
      stepCount={stepCount}
      onBack={onBack}
      onSkip={onSkip}
      onCta={onContinue}
    >
      <OnboardingHeading
        icon="phone"
        title="Who should we reach?"
        description="The people to reach if something happens to you."
      />

      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          description="Even one makes a difference."
        />
      ) : (
        <SectionCard className="overflow-hidden p-0">
          {contacts.map((contact, index) => (
            <View
              key={contact.id}
              className={`min-h-16 flex-row items-center gap-3 px-4 py-3${
                index > 0 ? " border-t border-border" : ""
              }`}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-xl bg-secondary"
                style={{ borderCurve: "continuous" }}
              >
                <AppIcon name="account" size={20} color={palette.primary} />
              </View>
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="text-base font-semibold leading-5 text-foreground">
                  {contact.name}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-[13px] leading-[18px] text-muted-foreground"
                >
                  {[contact.relation, contact.phone].filter(Boolean).join(", ")}
                </Text>
              </View>
              <Button
                unstyled
                className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
                onPress={() => remove(contact.id)}
                accessibilityLabel={`Remove ${contact.name}`}
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
        onPress={() => setShowForm(true)}
      >
        <AppIcon name="plus" size={18} color={palette.primary} />
        <Text className="font-semibold text-primary">
          {contacts.length === 0 ? "Add a contact" : "Add another"}
        </Text>
      </Button>

      <View className="flex-1" />

      <OnboardingSheet
        visible={showForm}
        title="New contact"
        submitLabel="Save contact"
        submitDisabled={!canSave}
        onCancel={() => {
          setDraft(EMPTY);
          setShowForm(false);
        }}
        onSubmit={saveDraft}
      >
        <FormField label="Name">
          <Input
            className="h-12 py-0"
            placeholder="Sam Ortiz"
            value={draft.name}
            onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
            returnKeyType="next"
          />
        </FormField>
        <FormField label="Phone number">
          <Input
            className="h-12 py-0"
            placeholder="555-0142"
            value={draft.phone}
            onChangeText={(phone) => setDraft((d) => ({ ...d, phone }))}
            keyboardType="phone-pad"
            returnKeyType="next"
          />
        </FormField>
        <FormField label="Relationship" description="Optional">
          <Input
            className="h-12 py-0"
            placeholder="Sister, neighbor, coworker"
            value={draft.relation}
            onChangeText={(relation) => setDraft((d) => ({ ...d, relation }))}
            returnKeyType="done"
            onSubmitEditing={saveDraft}
          />
        </FormField>
      </OnboardingSheet>
    </OnboardingShell>
  );
}
