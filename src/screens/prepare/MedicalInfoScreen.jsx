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
import { Textarea } from "../../components/ui/textarea";
import {
  SkeletonList,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { Text } from "../../components/ui/text";
import { useToast } from "../../components/ui/toast";
import { useRefresh } from "../../hooks/useRefresh";
import { db } from "../../lib/firebaseConfig";
import haptics from "../../lib/haptics";
import { getData } from "../../lib/storage/storageUtils";
import { useTheme } from "../../lib/theme";

const MED_KEY = "medical_info";
const EMPTY_FORM = {
  name: "",
  medications: "",
  allergies: "",
  bloodType: "",
  notes: "",
};

const DETAIL_FIELDS = ["medications", "allergies", "notes"];

function validate(form) {
  const errors = {};
  if (!form.name.trim()) {
    errors.name = "Whose information is this?";
  }
  const hasDetail =
    DETAIL_FIELDS.some((key) => form[key].trim()) || form.bloodType.trim();
  if (!hasDetail) {
    errors.medications =
      "Add at least one detail — medications, allergies, blood type or notes.";
  }
  return errors;
}

function MedicalCard({ entry, onEdit, onDelete }) {
  const details = [
    { label: "Medications", value: entry.medications },
    { label: "Allergies", value: entry.allergies },
    { label: "Notes", value: entry.notes },
  ].filter((detail) => detail.value);

  return (
    <Card className="gap-4 p-4">
      <View className="flex-row items-center gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-xl bg-secondary"
          style={{ borderCurve: "continuous" }}
        >
          <AppIcon name="medical-bag" size={20} className="text-primary" />
        </View>
        <View className="min-w-0 flex-1">
          <Text selectable className="text-callout font-bold text-foreground">
            {entry.name || "Unnamed profile"}
          </Text>
          <Text className="mt-0.5 text-caption text-muted-foreground">
            Updated{" "}
            {entry.updatedAt
              ? new Date(entry.updatedAt).toLocaleDateString()
              : "date unavailable"}
          </Text>
        </View>
        {entry.bloodType ? (
          <View className="rounded-full bg-secondary px-3 py-1.5">
            <Text
              selectable
              className="text-caption font-extrabold text-primary"
              accessibilityLabel={`Blood type ${entry.bloodType}`}
            >
              {entry.bloodType}
            </Text>
          </View>
        ) : null}
      </View>

      {details.length ? (
        <View
          className="overflow-hidden rounded-xl border border-border"
          style={{ borderCurve: "continuous" }}
        >
          {details.map((detail, index, list) => (
            <View
              key={detail.label}
              className={[
                "gap-1 px-4 py-3",
                index < list.length - 1 && "border-b border-border",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Text className="text-caption font-semibold text-muted-foreground">
                {detail.label}
              </Text>
              <Text selectable className="text-body text-foreground">
                {detail.value}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="rounded-xl bg-muted px-4 py-3">
          <Text className="text-body-sm text-muted-foreground">
            No additional medical details saved.
          </Text>
        </View>
      )}

      <View className="flex-row gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="min-h-11 flex-1"
          onPress={() => onEdit(entry)}
          accessibilityLabel={`Edit ${entry.name || "medical profile"}`}
        >
          <AppIcon name="pencil" size={16} className="text-primary" />
          <Text className="font-bold text-primary">Edit</Text>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 flex-1"
          onPress={() => onDelete(entry.id)}
          accessibilityLabel={`Delete ${entry.name || "medical profile"}`}
        >
          <AppIcon name="trash-can-outline" size={16} className="text-destructive" />
          <Text className="font-bold text-destructive">Delete</Text>
        </Button>
      </View>
    </Card>
  );
}

export default function MedicalInfo() {
  const [medicalList, setMedicalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const initialForm = useRef(EMPTY_FORM);

  const showSkeleton = useDelayedSkeleton(loading);
  const toast = useToast();
  const { palette } = useTheme();

  const nameRef = useRef(null);
  const medsRef = useRef(null);
  const allergiesRef = useRef(null);
  const bloodRef = useRef(null);
  const notesRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const rawMed = await AsyncStorage.getItem(MED_KEY);
      if (rawMed) {
        const parsed = JSON.parse(rawMed);
        if (Array.isArray(parsed)) setMedicalList(parsed);
        else if (parsed && typeof parsed === "object") setMedicalList([parsed]);
        return;
      }

      const username = (await getData("username")) || null;
      if (!username) return;
      try {
        const q = fsQuery(
          collection(db, "emergencyData"),
          where("username", "==", username),
          where("dataType", "==", "medical")
        );
        const snaps = await getDocs(q);
        if (snaps.empty) return;
        const fromDb = snaps.docs.map((snap) => {
          const payload = snap.data()?.data || {};
          return {
            id: snap.id,
            name: payload.name || payload.Name || "",
            medications: payload.medications || payload.Medications || "",
            allergies: payload.allergies || payload.Allergies || "",
            bloodType: payload.bloodType || payload.BloodType || "",
            notes: payload.notes || payload.Notes || "",
            updatedAt: payload.updatedAt || null,
          };
        });
        if (fromDb.length) {
          setMedicalList(fromDb);
          try {
            await AsyncStorage.setItem(MED_KEY, JSON.stringify(fromDb));
          } catch {
          }
        }
      } catch (dbError) {
        console.warn("medicalInfo: failed to load from firestore", dbError);
      }
    } catch (error) {
      console.warn("medicalInfo: failed to load", error);
      setLoadError("Your medical information could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { refreshing, onRefresh } = useRefresh(load);

  const saveMedicalList = useCallback(
    async (next) => {
      const username = (await getData("username")) || "unknown";
      const finalList = [];
      let remoteFailed = false;

      for (const entry of next || []) {
        const dataObj = {
          name: entry.name || "",
          medications: entry.medications || "",
          allergies: entry.allergies || "",
          bloodType: entry.bloodType || "",
          notes: entry.notes || "",
          updatedAt: new Date().toISOString(),
        };
        if (String(entry.id).startsWith("m_")) {
          try {
            const docRef = await addDoc(collection(db, "emergencyData"), {
              data: dataObj,
              dataType: "medical",
              username,
            });
            finalList.push({
              ...entry,
              id: docRef.id,
              updatedAt: dataObj.updatedAt,
            });
          } catch (error) {
            console.warn("medicalInfo: failed to add to firestore", error);
            remoteFailed = true;
            finalList.push(entry);
          }
        } else {
          try {
            await updateDoc(doc(db, "emergencyData", entry.id), {
              data: dataObj,
            });
            finalList.push({ ...entry, updatedAt: dataObj.updatedAt });
          } catch (error) {
            console.warn("medicalInfo: failed to update firestore", error);
            remoteFailed = true;
            finalList.push(entry);
          }
        }
      }

      try {
        await AsyncStorage.setItem(MED_KEY, JSON.stringify(finalList));
        setMedicalList(finalList);
      } catch (error) {
        console.warn("medicalInfo: failed to persist locally", error);
        setMedicalList(next);
        toast.error("Couldn’t save on this device", {
          description: "This profile may not be here next time you open the app.",
        });
        return false;
      }

      if (remoteFailed) {
        toast.warning("Saved on this device only", {
          description: "We couldn’t back this up to your account.",
        });
      }
      return true;
    },
    [toast]
  );

  const openEdit = (entry) => {
    const next = entry
      ? {
          name: entry.name || "",
          medications: entry.medications || "",
          allergies: entry.allergies || "",
          bloodType: entry.bloodType || "",
          notes: entry.notes || "",
        }
      : EMPTY_FORM;
    setEditingId(entry?.id || null);
    setForm(next);
    initialForm.current = next;
    setErrors({});
    setShowForm(true);
  };

  const handleSave = async () => {
    const trimmed = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    );
    const nextErrors = validate(trimmed);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      haptics.warning();
      if (nextErrors.name) nameRef.current?.focus?.();
      else medsRef.current?.focus?.();
      return;
    }

    setSaving(true);
    try {
      const entry = {
        id: editingId || `m_${Date.now()}`,
        ...trimmed,
        updatedAt: new Date().toISOString(),
      };
      const next = editingId
        ? medicalList.map((m) => (m.id === editingId ? entry : m))
        : [entry, ...medicalList];
      const ok = await saveMedicalList(next);
      if (ok) {
        setShowForm(false);
        setEditingId(null);
        toast.success(editingId ? "Profile updated" : "Profile added");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    const entry = medicalList.find((m) => m.id === id);
    if (!entry) return;
    Alert.alert(
      "Delete medical profile",
      `Delete ${entry.name || "this profile"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!String(id).startsWith("m_")) {
                await deleteDoc(doc(db, "emergencyData", id));
              }
            } catch (error) {
              console.warn("medicalInfo: failed to delete remote doc", error);
            }
            const ok = await saveMedicalList(
              medicalList.filter((m) => m.id !== id)
            );
            if (ok) toast.success("Profile deleted");
          },
        },
      ]
    );
  };

  const visibleList = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return medicalList;
    return medicalList.filter((entry) =>
      [entry.name, entry.medications, entry.allergies, entry.bloodType, entry.notes]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query))
    );
  }, [medicalList, search]);

  const dirty = useMemo(
    () =>
      Object.keys(EMPTY_FORM).some(
        (key) => form[key] !== initialForm.current[key]
      ),
    [form]
  );

  const update = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  if (loadError) {
    return (
      <ErrorState
        title="Medical information unavailable"
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
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
        <Card className="gap-5 p-5">
          <View className="flex-row items-center gap-4">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl bg-secondary"
              style={{ borderCurve: "continuous" }}
            >
              <AppIcon name="medical-bag" size={26} className="text-primary" />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-title-sm font-bold text-foreground">
                Critical details, together
              </Text>
              <Text className="text-body-sm text-muted-foreground">
                {medicalList.length === 0
                  ? "Keep essential health information easy to find."
                  : `${medicalList.length} ${medicalList.length === 1 ? "medical profile" : "medical profiles"} saved.`}
              </Text>
            </View>
          </View>
          <Button className="min-h-12 rounded-xl" onPress={() => openEdit(null)}>
            <AppIcon name="plus" size={19} className="text-primary-foreground" />
            <Text className="text-body-lg font-bold text-primary-foreground">
              Add medical profile
            </Text>
          </Button>
        </Card>

        <View className="gap-3">
          <SectionHeader
            title="Medical profiles"
            description="Information to reference or share in an emergency."
          />
          {!loading && medicalList.length > 3 ? (
            <SearchField
              value={search}
              onChangeText={setSearch}
              placeholder="Search name, medication or allergy"
              accessibilityLabel="Search medical profiles"
            />
          ) : null}
          {loading ? (
            showSkeleton ? <SkeletonList count={3} /> : <View className="h-40" />
          ) : visibleList.length === 0 && search.trim() ? (
            <EmptyState
              icon={APP_ICONS["medical-bag"]}
              title="No matches"
              description={`Nothing matches “${search.trim()}”.`}
              action={
                <Button size="sm" variant="secondary" onPress={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : medicalList.length === 0 ? (
            <EmptyState
              icon={APP_ICONS["medical-bag"]}
              title="No medical information saved"
              description="Add medications, allergies, blood type, or care notes."
              action={
                <Button size="sm" onPress={() => openEdit(null)}>
                  Add a profile
                </Button>
              }
            />
          ) : (
            <View className="gap-3">
              {visibleList.map((entry) => (
                <MedicalCard
                  key={entry.id}
                  entry={entry}
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
        onOpenChange={(next) => {
          setShowForm(next);
          if (!next) setEditingId(null);
        }}
        title={editingId ? "Edit medical profile" : "New medical profile"}
        description="Record only the information that would help during an emergency."
        dirty={dirty}
        submitting={saving}
        onSubmit={handleSave}
        submitLabel="Save profile"
        maxHeightRatio={0.85}
      >
        <FormField label="Name" error={errors.name}>
          <Input
            ref={nameRef}
            placeholder="Person's name"
            value={form.name}
            onChangeText={update("name")}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => medsRef.current?.focus?.()}
          />
        </FormField>
        <FormField label="Medications" error={errors.medications}>
          <Input
            ref={medsRef}
            placeholder="Medication and dosage"
            value={form.medications}
            onChangeText={update("medications")}
            returnKeyType="next"
            onSubmitEditing={() => allergiesRef.current?.focus?.()}
          />
        </FormField>
        <FormField label="Allergies">
          <Input
            ref={allergiesRef}
            placeholder="Medication, food, or other allergies"
            value={form.allergies}
            onChangeText={update("allergies")}
            returnKeyType="next"
            onSubmitEditing={() => bloodRef.current?.focus?.()}
          />
        </FormField>
        <FormField label="Blood type">
          <Input
            ref={bloodRef}
            placeholder="Example: O+"
            value={form.bloodType}
            onChangeText={update("bloodType")}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => notesRef.current?.focus?.()}
          />
        </FormField>
        <FormField label="Care notes">
          <Textarea
            ref={notesRef}
            placeholder="Conditions, equipment, or other instructions"
            value={form.notes}
            onChangeText={update("notes")}
          />
        </FormField>
      </FormSheet>
    </Screen>
  );
}
