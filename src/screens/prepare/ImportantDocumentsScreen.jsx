import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
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
import { ImageViewer } from "../../components/ui/image-viewer";
import { Input } from "../../components/ui/input";
import { SearchField } from "../../components/ui/search-field";
import {
  SkeletonList,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import { Text } from "../../components/ui/text";
import { useToast } from "../../components/ui/toast";
import haptics from "../../lib/haptics";

const STORAGE_KEY = "important_documents";
const EMPTY_META = { title: "", notes: "" };

export default function ImportantDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showMetaSheet, setShowMetaSheet] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [meta, setMeta] = useState(EMPTY_META);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState("");
  const initialMeta = useRef(EMPTY_META);

  const showSkeleton = useDelayedSkeleton(loading);
  const toast = useToast();
  const titleRef = useRef(null);
  const notesRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setDocs(JSON.parse(raw));
    } catch (error) {
      console.warn("Failed to load docs", error);
      setLoadError("Your documents could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveDocs = useCallback(
    async (next) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setDocs(next);
        return true;
      } catch (error) {
        console.warn("Failed to save docs", error);
        toast.error("Couldn’t save the document", {
          description: "There may not be enough space on this device.",
        });
        return false;
      }
    },
    [toast]
  );

  const startWithAsset = (asset) => {
    if (!asset) return;
    if (!asset.fileName && asset.uri) {
      asset.fileName = asset.uri.split("/").pop();
    }
    const next = { title: asset.fileName || "Photo", notes: "" };
    setPendingFile(asset);
    setMeta(next);
    initialMeta.current = next;
    setErrors({});
    setShowMetaSheet(true);
  };

  const pickImage = async ({ fromCamera }) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        toast.error(
          fromCamera ? "Camera access needed" : "Photo access needed",
          {
            description:
              "Allow access in your device settings to add a document.",
          }
        );
        return;
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      };
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || result.cancelled) return;
      startWithAsset(
        result.assets?.[0] || (result.uri ? { uri: result.uri } : null)
      );
    } catch (error) {
      console.warn("Failed to pick image", error);
      toast.error(
        fromCamera ? "Couldn’t open the camera" : "Couldn’t open your photos"
      );
    }
  };

  const confirmSavePending = async () => {
    if (!pendingFile) {
      setShowMetaSheet(false);
      return;
    }
    const title = meta.title.trim();
    if (!title) {
      setErrors({ title: "Give this document a name you will recognise." });
      haptics.warning();
      titleRef.current?.focus?.();
      return;
    }

    setSaving(true);
    try {
      const entry = {
        id: `d_${Date.now()}`,
        title,
        notes: meta.notes.trim(),
        uri: pendingFile.uri,
        type: pendingFile.type || "image",
        fileName: pendingFile.fileName || null,
        createdAt: new Date().toISOString(),
      };
      const ok = await saveDocs([entry, ...docs]);
      if (ok) {
        setPendingFile(null);
        setMeta(EMPTY_META);
        setShowMetaSheet(false);
        toast.success("Document saved", {
          description: "Stored on this device and available offline.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    const entry = docs.find((d) => d.id === id);
    if (!entry) return;
    Alert.alert("Delete document", `Delete “${entry.title || "document"}”?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const ok = await saveDocs(docs.filter((d) => d.id !== id));
          if (ok) toast.success("Document deleted");
        },
      },
    ]);
  };

  const visibleDocs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return docs;
    return docs.filter((doc) =>
      [doc.title, doc.notes, doc.fileName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query))
    );
  }, [docs, search]);

  const dirty = useMemo(
    () =>
      meta.title !== initialMeta.current.title ||
      meta.notes !== initialMeta.current.notes,
    [meta]
  );

  const update = (key) => (value) => {
    setMeta((m) => ({ ...m, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  if (loadError) {
    return (
      <ErrorState
        title="Documents unavailable"
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
      >
        <Card className="gap-5 p-5">
          <View className="flex-row items-center gap-4">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl bg-secondary"
              style={{ borderCurve: "continuous" }}
            >
              <AppIcon name="file-document" size={26} className="text-primary" />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-title-sm font-bold text-foreground">
                Your document wallet
              </Text>
              <Text className="text-body-sm text-muted-foreground">
                {docs.length === 0
                  ? "Keep photos of essential records in one place."
                  : `${docs.length} ${docs.length === 1 ? "document" : "documents"} stored on this device.`}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onPress={() => pickImage({ fromCamera: true })}
            >
              <AppIcon name="camera" size={18} className="text-primary" />
              <Text className="font-bold text-primary">Take photo</Text>
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onPress={() => pickImage({ fromCamera: false })}
            >
              <AppIcon name="images" size={18} className="text-primary" />
              <Text className="font-bold text-primary">Choose photo</Text>
            </Button>
          </View>
        </Card>

        <View className="gap-3">
          <SectionHeader
            title="Important documents"
            description="IDs, insurance records, and other critical files."
          />
          {!loading && docs.length > 4 ? (
            <SearchField
              value={search}
              onChangeText={setSearch}
              placeholder="Search title or notes"
              accessibilityLabel="Search documents"
            />
          ) : null}
          {loading ? (
            showSkeleton ? <SkeletonList count={3} /> : <View className="h-40" />
          ) : visibleDocs.length === 0 && search.trim() ? (
            <EmptyState
              icon={APP_ICONS["file-document"]}
              title="No matches"
              description={`Nothing matches “${search.trim()}”.`}
              action={
                <Button size="sm" variant="secondary" onPress={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : docs.length === 0 ? (
            <EmptyState
              icon={APP_ICONS["file-document"]}
              title="No documents yet"
              description="Take or choose a photo of a document you may need quickly."
              action={
                <Button size="sm" onPress={() => pickImage({ fromCamera: true })}>
                  Add your first document
                </Button>
              }
            />
          ) : (
            <View className="gap-3">
              {visibleDocs.map((item) => {
                const isImage = !item.type || item.type.startsWith("image");
                return (
                  <Card key={item.id} className="gap-4 p-4">
                    <View className="flex-row gap-4">
                      {isImage ? (
                        <Image
                          source={{ uri: item.uri }}
                          contentFit="cover"
                          className="h-[84px] w-[84px] rounded-xl bg-muted"
                          style={{ borderCurve: "continuous" }}
                          accessibilityLabel=""
                        />
                      ) : (
                        <View
                          className="h-[84px] w-[84px] items-center justify-center rounded-xl bg-muted"
                          style={{ borderCurve: "continuous" }}
                        >
                          <AppIcon
                            name="file-document"
                            size={26}
                            className="text-muted-foreground"
                          />
                        </View>
                      )}
                      <View className="min-w-0 flex-1 gap-1">
                        <Text
                          selectable
                          numberOfLines={2}
                          className="text-callout font-bold text-foreground"
                        >
                          {item.title}
                        </Text>
                        {item.notes ? (
                          <Text
                            selectable
                            numberOfLines={2}
                            className="text-footnote text-muted-foreground"
                          >
                            {item.notes}
                          </Text>
                        ) : (
                          <Text className="text-footnote text-muted-foreground">
                            No notes
                          </Text>
                        )}
                        <Text className="mt-auto text-caption font-medium text-muted-foreground">
                          Added{" "}
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "date unavailable"}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="min-h-11 flex-1"
                        onPress={() => setViewing(item)}
                        accessibilityLabel={`View ${item.title}`}
                      >
                        <AppIcon name="eye" size={16} className="text-primary" />
                        <Text className="font-bold text-primary">View</Text>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-11 flex-1"
                        onPress={() => handleDelete(item.id)}
                        accessibilityLabel={`Delete ${item.title}`}
                      >
                        <AppIcon
                          name="trash-can-outline"
                          size={16}
                          className="text-destructive"
                        />
                        <Text className="font-bold text-destructive">Delete</Text>
                      </Button>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <FormSheet
        open={showMetaSheet}
        onOpenChange={(next) => {
          setShowMetaSheet(next);
          if (!next) setPendingFile(null);
        }}
        title="Document details"
        description="Give this photo a clear name so it is easy to find."
        dirty={dirty}
        submitting={saving}
        onSubmit={confirmSavePending}
        submitLabel="Save document"
      >
        <FormField label="Title" error={errors.title}>
          <Input
            ref={titleRef}
            placeholder="Example: Health insurance card"
            value={meta.title}
            onChangeText={update("title")}
            returnKeyType="next"
            onSubmitEditing={() => notesRef.current?.focus?.()}
          />
        </FormField>
        <FormField label="Notes" description="Optional">
          <Textarea
            ref={notesRef}
            placeholder="Policy number, owner, or reminder"
            value={meta.notes}
            onChangeText={update("notes")}
          />
        </FormField>
      </FormSheet>

      <ImageViewer
        visible={Boolean(viewing)}
        uri={viewing?.uri}
        title={viewing?.title}
        notes={viewing?.notes}
        onClose={() => setViewing(null)}
      />
    </Screen>
  );
}
