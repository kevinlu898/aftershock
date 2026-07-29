import { Button } from "../../components/ui/button";
import { AppIcon } from "../../components/app-icon";
import { EmptyState, StatusCard } from "../../components/app-ui";
import { Input } from "../../components/ui/input";
import {
  SkeletonList,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, InputAccessoryView, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
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
      
      <ScrollView contentContainerClassName="p-[20px]" contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        <View className={"bg-card p-[20px] rounded-[16px] mb-[12px] shadow-sm border border-border"}>
          <Text className={"text-muted-foreground mt-[6px]"}>Store photos or documents (e.g., IDs, insurance) locally. You can take a photo or choose from your library.</Text>

          <View className="flex-row mt-[12px]">
            <Button unstyled className={["py-[10px] px-[12px] bg-secondary rounded-[8px]", "mr-[8px]"].filter(Boolean).join(" ")} onPress={openCamera}>
              <View className="flex-row items-center gap-2">
                <AppIcon name="camera" size={17} className="text-primary" />
                <Text className={"text-primary font-bold"}>Take Photo</Text>
              </View>
            </Button>
            <Button unstyled className={"py-[10px] px-[12px] bg-secondary rounded-[8px]"} onPress={pickFromLibrary}>
              <View className="flex-row items-center gap-2">
                <AppIcon name="images" size={17} className="text-primary" />
                <Text className={"text-primary font-bold"}>Open Library</Text>
              </View>
            </Button>
          </View>

          {loading ? showSkeleton ? <SkeletonList count={3} className="mt-4" /> : <View className="h-40" /> : loadError ? <StatusCard className="mt-4" tone="danger" title="Documents unavailable" description={loadError} /> : docs.length === 0 ? <EmptyState className="mt-4 bg-muted/40" title="No documents yet" description="Add a photo of an ID, insurance policy, or other critical document." /> : <FlatList data={docs} keyExtractor={i => i.id} className="mt-[12px]" renderItem={({
          item
        }) => <View className={"flex-row items-center py-[12px] border-b border-border"}>
                  {item.type && item.type.startsWith('image') ? <Image source={{
            uri: item.uri
          }} className={"w-[64px] h-[64px] rounded-[8px] bg-muted"} /> : <View className={"w-[64px] h-[64px] rounded-[8px] bg-muted justify-center items-center"}><Text className="text-muted-foreground">DOC</Text></View>}
                  <View className="flex-1 ml-[12px]">
                    <Text className={"font-bold text-secondary-foreground"}>{item.title}</Text>
                    {item.notes ? <Text className={"text-muted-foreground mt-[4px]"}>{item.notes}</Text> : null}
                    <View className="flex-row mt-[8px]">
                      <Button unstyled onPress={() => handleView(item)} className={["py-[6px] px-[8px] rounded-[8px] bg-card border border-border", "mr-[8px]"].filter(Boolean).join(" ")}>
                        <Text className={"text-primary font-bold"}>View</Text>
                      </Button>
                      <Button unstyled onPress={() => handleDelete(item.id)} className={"py-[6px] px-[8px] rounded-[8px] bg-card border border-border"}>
                        <Text className={["text-primary font-bold", "text-destructive"].filter(Boolean).join(" ")}>Delete</Text>
                      </Button>
                    </View>
                  </View>
                </View>} />}
        </View>

      </ScrollView>

      <Modal visible={showMetaModal} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View className={"flex-1 justify-end bg-[rgba(0,0,0,0.35)]"}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 20}>
              <View className={"bg-card p-[16px] rounded-tl-[12px] rounded-tr-[12px]"}>
                <Text className={"font-extrabold text-[18px] mb-[8px] text-primary"}>Document Details</Text>
                <Text className={"mt-[12px] font-semibold text-secondary-foreground"}>Title</Text>
                <Input inputAccessoryViewID={'docAccessory'} placeholder="Title" value={meta.title} onChangeText={t => setMeta(m => ({
                ...m,
                title: t
              }))} className={"border border-border rounded-[8px] p-[10px] mt-[8px] bg-card"} returnKeyType="next" onSubmitEditing={() => Keyboard.dismiss()} />
                <Text className={"mt-[12px] font-semibold text-secondary-foreground"}>Notes</Text>
                <Input inputAccessoryViewID={'docAccessory'} placeholder="Notes" value={meta.notes} onChangeText={t => setMeta(m => ({
                ...m,
                notes: t
              }))} className={["border border-border rounded-[8px] p-[10px] mt-[8px] bg-card", "h-[80px]"].filter(Boolean).join(" ")} multiline textAlignVertical="top" returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />

                <View className="flex-row justify-end mt-[12px]">
                  <Button unstyled onPress={() => {
                  Keyboard.dismiss();
                  setShowMetaModal(false);
                  setPendingFile(null);
                }} className={["py-[10px] px-[14px] rounded-[10px]", "bg-muted"].filter(Boolean).join(" ")}>
                    <Text className="text-foreground font-bold">Cancel</Text>
                  </Button>
                  <Button unstyled onPress={confirmSavePending} className={["py-[10px] px-[14px] rounded-[10px]", "ml-[8px] bg-primary"].filter(Boolean).join(" ")}>
                    <Text className="text-primary-foreground font-bold">Save</Text>
                  </Button>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
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
