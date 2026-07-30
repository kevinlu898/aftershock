import { Button } from "../../components/ui/button";
import { AppIcon } from "../../components/app-icon";
import {
  EmptyState,
  FormField,
  SectionHeader,
  StatusCard,
} from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  SkeletonList,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, InputAccessoryView, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Text, View } from 'react-native';
const STORAGE_KEY = 'important_documents';
export default function ImportantDocuments({
  navigation
}) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [meta, setMeta] = useState({
    title: '',
    notes: ''
  });
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setDocs(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to load docs', e);
        setLoadError("Your documents could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const saveDocs = async next => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setDocs(next);
    } catch (error) {
      console.warn('Failed to save docs', error);
    }
  };
  const openCamera = async () => {
    try {
      const {
        status
      } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is required to take photos.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false
      });
      if (res.canceled || res.cancelled) return;
      const asset = res.assets?.[0] || (res.uri ? {
        uri: res.uri
      } : null);
      if (!asset) return;
      if (!asset.fileName && asset.uri) asset.fileName = asset.uri.split('/').pop();
      setPendingFile(asset);
      setMeta({
        title: asset.fileName || 'Photo',
        notes: ''
      });
      setShowMetaModal(true);
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Unable to open camera');
    }
  };
  const pickFromLibrary = async () => {
    try {
      const {
        status
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Media library permission is required to pick photos.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false
      });
      if (res.canceled || res.cancelled) return;
      const asset = res.assets?.[0] || (res.uri ? {
        uri: res.uri
      } : null);
      if (!asset) return;
      if (!asset.fileName && asset.uri) asset.fileName = asset.uri.split('/').pop();
      setPendingFile(asset);
      setMeta({
        title: asset.fileName || 'Photo',
        notes: ''
      });
      setShowMetaModal(true);
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Unable to open library');
    }
  };
  const confirmSavePending = async () => {
    if (!pendingFile) return setShowMetaModal(false);
    const entry = {
      id: `d_${Date.now()}`,
      title: (meta.title || pendingFile.fileName || 'Document').trim(),
      notes: meta.notes || '',
      uri: pendingFile.uri,
      type: pendingFile.type || 'image',
      fileName: pendingFile.fileName || null,
      createdAt: new Date().toISOString()
    };
    const next = [entry, ...docs];
    await saveDocs(next);
    setPendingFile(null);
    setMeta({
      title: '',
      notes: ''
    });
    setShowMetaModal(false);
  };
  const handleView = async item => {
    if (!item || !item.uri) return;
    try {
      await Linking.openURL(item.uri);
    } catch (_error) {
      Alert.alert('Open failed', 'Unable to open the document on this device.');
    }
  };
  const handleDelete = id => {
    const entry = docs.find(d => d.id === id);
    if (!entry) return;
    Alert.alert('Delete Document', `Delete "${entry.title || 'document'}"?`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        const next = docs.filter(d => d.id !== id);
        await saveDocs(next);
      }
    }]);
  };
  return <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-6 px-5 py-6"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <Card className="gap-5 p-5">
          <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-secondary" style={{ borderCurve: "continuous" }}>
              <AppIcon name="file-document" size={26} className="text-primary" />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-lg font-bold text-foreground">Your document wallet</Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                {docs.length === 0
                  ? "Keep photos of essential records in one place."
                  : `${docs.length} ${docs.length === 1 ? "document" : "documents"} stored on this device.`}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <Button variant="secondary" className="flex-1" onPress={openCamera}>
              <AppIcon name="camera" size={18} className="text-primary" />
              <Text className="font-bold text-primary">Take photo</Text>
            </Button>
            <Button variant="secondary" className="flex-1" onPress={pickFromLibrary}>
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
          {loading ? (
            showSkeleton ? <SkeletonList count={3} /> : <View className="h-40" />
          ) : loadError ? (
            <StatusCard tone="danger" title="Documents unavailable" description={loadError} />
          ) : docs.length === 0 ? (
            <EmptyState
              className="bg-card"
              title="No documents yet"
              description="Take or choose a photo of a document you may need quickly."
            >
              <View className="mt-5 h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <AppIcon name="file-document" size={22} className="text-primary" />
              </View>
            </EmptyState>
          ) : (
            <View className="gap-3">
              {docs.map(item => (
                <Card key={item.id} className="gap-4 p-4">
                  <View className="flex-row gap-4">
                    {item.type && item.type.startsWith('image') ? (
                      <Image
                        source={{ uri: item.uri }}
                        contentFit="cover"
                        className="h-[84px] w-[84px] rounded-xl bg-muted"
                        style={{ borderCurve: "continuous" }}
                      />
                    ) : (
                      <View className="h-[84px] w-[84px] items-center justify-center rounded-xl bg-muted" style={{ borderCurve: "continuous" }}>
                        <AppIcon name="file-document" size={26} className="text-muted-foreground" />
                      </View>
                    )}
                    <View className="min-w-0 flex-1 gap-1">
                      <Text selectable numberOfLines={2} className="text-[17px] font-bold leading-[22px] text-foreground">
                        {item.title}
                      </Text>
                      {item.notes ? (
                        <Text selectable numberOfLines={2} className="text-[13px] leading-[18px] text-muted-foreground">
                          {item.notes}
                        </Text>
                      ) : (
                        <Text className="text-[13px] text-muted-foreground">No notes</Text>
                      )}
                      <Text className="mt-auto text-xs font-medium text-muted-foreground">
                        Added {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "date unavailable"}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" onPress={() => handleView(item)}>
                      <AppIcon name="eye" size={16} className="text-primary" />
                      <Text className="font-bold text-primary">View</Text>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onPress={() => handleDelete(item.id)}>
                      <AppIcon name="trash-can-outline" size={16} className="text-destructive" />
                      <Text className="font-bold text-destructive">Delete</Text>
                    </Button>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showMetaModal} animationType="slide" transparent onRequestClose={() => setShowMetaModal(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="rounded-t-[28px] border border-border bg-card px-5 pb-6 pt-3" style={{ borderCurve: "continuous" }}>
              <View className="mb-4 h-1.5 w-10 self-center rounded-full bg-border" />
              <View className="mb-5 gap-1">
                <Text className="text-xl font-extrabold text-foreground">Document details</Text>
                <Text className="text-sm leading-5 text-muted-foreground">
                  Give this photo a clear name so it is easy to find.
                </Text>
              </View>
              <View className="gap-4">
                <FormField label="Title">
                  <Input inputAccessoryViewID={'docAccessory'} placeholder="Example: Health insurance card" value={meta.title} onChangeText={t => setMeta(m => ({
                    ...m,
                    title: t
                  }))} returnKeyType="next" />
                </FormField>
                <FormField label="Notes" description="Optional">
                  <Input inputAccessoryViewID={'docAccessory'} placeholder="Policy number, owner, or reminder" value={meta.notes} onChangeText={t => setMeta(m => ({
                    ...m,
                    notes: t
                  }))} className="min-h-[96px]" multiline returnKeyType="done" />
                </FormField>
              </View>
              <View className="mt-6 flex-row gap-3">
                <Button variant="secondary" className="flex-1" onPress={() => {
                  Keyboard.dismiss();
                  setShowMetaModal(false);
                  setPendingFile(null);
                }}>
                  <Text className="font-bold text-secondary-foreground">Cancel</Text>
                </Button>
                <Button className="flex-1" onPress={confirmSavePending}>
                  <Text className="font-bold text-primary-foreground">Save document</Text>
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {Platform.OS === 'ios' && <InputAccessoryView nativeID={'docAccessory'}>
          <View className={"bg-card p-[8px] border-t border-border flex-row justify-end"}>
            <Button unstyled onPress={() => Keyboard.dismiss()} className={"py-[10px] px-[14px] rounded-[10px]"}>
              <Text className={"text-primary font-bold"}>Done</Text>
            </Button>
          </View>
        </InputAccessoryView>}
    </View>;
}
