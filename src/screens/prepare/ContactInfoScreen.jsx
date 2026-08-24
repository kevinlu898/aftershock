import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  query as fsQuery,
  getDocs,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { APP_ICONS, AppIcon } from "../../components/app-icon";
import {
  EmptyState,
  ErrorState,
  FormField,
  Screen,
  SectionHeader,
} from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { FormSheet } from "../../components/ui/form-sheet";
import { Input } from "../../components/ui/input";
import { SearchField } from "../../components/ui/search-field";
import {
  SkeletonList,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { Text } from "../../components/ui/text";
import { useToast } from "../../components/ui/toast";
import { useRefresh } from "../../hooks/useRefresh";
import { callNumber, isDialable } from "../../lib/contact";
import { db } from "../../lib/firebaseConfig";
import haptics from "../../lib/haptics";
import { getData } from "../../lib/storage/storageUtils";
import { useTheme } from "../../lib/theme";

const STORAGE_KEY = "emergency_contacts";
const EMPTY_FORM = { name: "", phone: "", relation: "" };

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Enter a name so you can find them fast.";
  if (!form.phone.trim()) {
    errors.phone = "Enter a phone number.";
  } else if (!isDialable(form.phone)) {
    errors.phone = "That doesn’t look like a number this device can dial.";
  }
  return errors;
}

function ContactCard({ contact, onCall, onEdit, onDelete }) {
  const dialable = isDialable(contact.phone);

  return (
    <Card className="gap-4 p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
          <Text className="text-body-lg font-extrabold text-primary">
            {(contact.name || "?").trim().charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text selectable className="text-callout font-bold text-foreground">
            {contact.name}
          </Text>
          <Text className="text-footnote font-medium text-muted-foreground">
            {contact.relation || "Emergency contact"}
          </Text>
        </View>
      </View>

      {dialable ? (
        <Button
          unstyled
          className="min-h-14 flex-row items-center gap-3 rounded-xl bg-secondary px-4 py-3 active:opacity-80"
          style={{ borderCurve: "continuous" }}
          onPress={() => onCall(contact)}
          accessibilityLabel={`Call ${contact.name} on ${contact.phone}`}
          accessibilityHint="Opens your phone app with this number ready to dial"
        >
          <AppIcon name="phone" size={20} className="text-primary" />
          <View className="min-w-0 flex-1">
            <Text className="text-caption font-semibold text-muted-foreground">
              Tap to call
            </Text>
            <Text className="text-body-lg font-bold text-primary">
              {contact.phone}
            </Text>
          </View>
        </Button>
      ) : (
        <View
          className="rounded-xl bg-muted px-4 py-3"
          style={{ borderCurve: "continuous" }}
        >
          <Text className="text-caption font-semibold text-muted-foreground">
            Phone number
          </Text>
          <Text selectable className="mt-1 text-body-lg font-semibold text-foreground">
            {contact.phone || "Not set"}
          </Text>
        </View>
      )}

      <View className="flex-row gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="min-h-11 flex-1"
          onPress={() => onEdit(contact)}
          accessibilityLabel={`Edit ${contact.name}`}
        >
          <AppIcon name="pencil" size={16} className="text-primary" />
          <Text className="font-bold text-primary">Edit</Text>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 flex-1"
          onPress={() => onDelete(contact.id)}
          accessibilityLabel={`Delete ${contact.name}`}
        >
          <AppIcon name="trash-can-outline" size={16} className="text-destructive" />
          <Text className="font-bold text-destructive">Delete</Text>
        </Button>
      </View>
    </Card>
  );
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const initialForm = useRef(EMPTY_FORM);

  const showSkeleton = useDelayedSkeleton(loading);
  const toast = useToast();
  const { palette } = useTheme();
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const relationRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setContacts(JSON.parse(raw));
        return;
      }
      const username = (await getData("username")) || null;
      if (!username) return;
      try {
        const q = fsQuery(
          collection(db, "emergencyData"),
          where("username", "==", username),
          where("dataType", "==", "contacts")
        );
        const snaps = await getDocs(q);
        if (snaps.empty) return;
        const fromDb = snaps.docs.map((snap) => {
          const d = snap.data()?.data || {};
          return {
            id: snap.id,
            name: d.name || "",
            phone: d.phone || "",
            relation: d.relation || "",
          };
        });
        if (fromDb.length) {
          setContacts(fromDb);
          try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fromDb));
          } catch {
          }
        }
      } catch (dbError) {
        console.warn("contacts: failed to load from firestore", dbError);
      }
    } catch (error) {
      console.warn("contacts: failed to load", error);
      setLoadError("Your emergency contacts could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { refreshing, onRefresh } = useRefresh(load);

  const save = useCallback(
    async (next) => {
      const username = (await getData("username")) || "unknown";
      const finalContacts = [];
      let remoteFailed = false;

      for (const contact of next || []) {
        const dataObj = {
          name: contact.name || "",
          phone: contact.phone || "",
          relation: contact.relation || "",
          blank1: "",
          blank2: "",
        };
        if (String(contact.id).startsWith("c_")) {
          try {
            const docRef = await addDoc(collection(db, "emergencyData"), {
              data: dataObj,
              dataType: "contacts",
              username,
            });
            finalContacts.push({ ...contact, id: docRef.id });
          } catch (error) {
            console.warn("contacts: failed to add to firestore", error);
            remoteFailed = true;
            finalContacts.push(contact);
          }
        } else {
          try {
            await updateDoc(doc(db, "emergencyData", contact.id), {
              data: dataObj,
            });
            finalContacts.push(contact);
          } catch (error) {
            console.warn("contacts: failed to update firestore", error);
            remoteFailed = true;
            finalContacts.push(contact);
          }
        }
      }

      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalContacts));
      } catch (error) {
        console.warn("contacts: failed to persist locally", error);
        toast.error("Couldn’t save on this device", {
          description: "Your contact may not be here next time you open the app.",
        });
        setContacts(finalContacts);
        return false;
      }

      setContacts(finalContacts);
      if (remoteFailed) {
        toast.warning("Saved on this device only", {
          description: "We couldn’t back this up to your account. It will stay available offline.",
        });
        return true;
      }
      return true;
    },
    [toast]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    initialForm.current = EMPTY_FORM;
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (contact) => {
    const next = {
      name: contact.name || "",
      phone: contact.phone || "",
      relation: contact.relation || "",
    };
    setEditingId(contact.id);
    setForm(next);
    initialForm.current = next;
    setErrors({});
    setShowForm(true);
  };

  const handleCall = async (contact) => {
    const started = await callNumber(contact.phone);
    if (!started) {
      toast.error(`Couldn’t call ${contact.name}`, {
        description: "Your device wouldn’t open the dialer for that number.",
      });
    }
  };

  const handleDelete = (id) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    Alert.alert(
      "Delete contact",
      `Delete ${contact.name || "this contact"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const next = contacts.filter((c) => c.id !== id);
            try {
              if (!String(id).startsWith("c_")) {
                await deleteDoc(doc(db, "emergencyData", id));
              }
            } catch (error) {
              console.warn("contacts: failed to delete remote doc", error);
            }
            const ok = await save(next);
            if (ok) toast.success(`${contact.name || "Contact"} deleted`);
          },
        },
      ]
    );
  };

  const handleSaveForm = async () => {
    const trimmed = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      relation: form.relation.trim(),
    };
    const nextErrors = validate(trimmed);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      haptics.warning();
      if (nextErrors.name) nameRef.current?.focus?.();
      else if (nextErrors.phone) phoneRef.current?.focus?.();
      return;
    }

    setSaving(true);
    try {
      const next = editingId
        ? contacts.map((c) => (c.id === editingId ? { ...c, ...trimmed } : c))
        : [{ id: `c_${Date.now()}`, ...trimmed }, ...contacts];
      const ok = await save(next);
      if (ok) {
        setShowForm(false);
        toast.success(editingId ? "Contact updated" : "Contact added");
      }
    } finally {
      setSaving(false);
    }
  };

  const visibleContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((c) =>
      [c.name, c.relation, c.phone]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query))
    );
  }, [contacts, search]);

  const dirty = useMemo(
    () =>
      form.name !== initialForm.current.name ||
      form.phone !== initialForm.current.phone ||
      form.relation !== initialForm.current.relation,
    [form]
  );

  const update = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  if (loadError) {
    return (
      <ErrorState
        title="Contacts unavailable"
        description={loadError}
        onRetry={load}
      />
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="gap-6 px-5 py-6"
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
        <Card className="gap-5 overflow-hidden p-5">
          <View className="flex-row items-center gap-4">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl bg-secondary"
              style={{ borderCurve: "continuous" }}
            >
              <AppIcon name="phone" size={26} className="text-primary" />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-title-sm font-bold text-foreground">
                Your call list
              </Text>
              <Text className="text-body-sm text-muted-foreground">
                {contacts.length === 0
                  ? "Keep trusted people close when every minute matters."
                  : `${contacts.length} ${contacts.length === 1 ? "person" : "people"} ready to contact.`}
              </Text>
            </View>
          </View>
          <Button className="min-h-12 rounded-xl" onPress={openAdd}>
            <AppIcon name="plus" size={19} className="text-primary-foreground" />
            <Text className="text-body-lg font-bold text-primary-foreground">
              Add contact
            </Text>
          </Button>
        </Card>

        <View className="gap-3">
          <SectionHeader
            title="Emergency contacts"
            description="Saved to your account and available offline."
          />
          {!loading && contacts.length > 4 ? (
            <SearchField
              value={search}
              onChangeText={setSearch}
              placeholder="Search name, relationship or number"
              accessibilityLabel="Search contacts"
            />
          ) : null}
          {loading ? (
            showSkeleton ? <SkeletonList count={3} /> : <View className="h-40" />
          ) : visibleContacts.length === 0 && search.trim() ? (
            <EmptyState
              icon={APP_ICONS.account}
              title="No matches"
              description={`Nothing matches “${search.trim()}”.`}
              action={
                <Button size="sm" variant="secondary" onPress={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : contacts.length === 0 ? (
            <EmptyState
              icon={APP_ICONS.account}
              title="No contacts yet"
              description="Add the people you would call or text first."
              action={
                <Button size="sm" onPress={openAdd}>
                  Add your first contact
                </Button>
              }
            />
          ) : (
            <View className="gap-3">
              {visibleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onCall={handleCall}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FormSheet
        open={showForm}
        onOpenChange={setShowForm}
        title={editingId ? "Edit contact" : "New contact"}
        description="Add the details you will need during an emergency."
        dirty={dirty}
        submitting={saving}
        onSubmit={handleSaveForm}
        submitLabel="Save contact"
      >
        <FormField label="Name" error={errors.name}>
          <Input
            ref={nameRef}
            placeholder="Full name"
            value={form.name}
            onChangeText={update("name")}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus?.()}
          />
        </FormField>
        <FormField label="Phone number" error={errors.phone}>
          <Input
            ref={phoneRef}
            placeholder="Phone number"
            value={form.phone}
            onChangeText={update("phone")}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            returnKeyType="next"
            onSubmitEditing={() => relationRef.current?.focus?.()}
          />
        </FormField>
        <FormField label="Relationship" description="Optional">
          <Input
            ref={relationRef}
            placeholder="Family, neighbor, friend"
            value={form.relation}
            onChangeText={update("relation")}
            returnKeyType="done"
            onSubmitEditing={handleSaveForm}
          />
        </FormField>
      </FormSheet>
    </Screen>
  );
}
