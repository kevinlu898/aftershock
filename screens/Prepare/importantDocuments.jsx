import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, InputAccessoryView, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../css';

const STORAGE_KEY = 'important_documents';

export default function ImportantDocuments({ navigation }) {
  const insets = useSafeAreaInsets();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [meta, setMeta] = useState({ title: '', notes: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setDocs(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to load docs', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveDocs = async (next) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setDocs(next);
    } catch (e) {
      console.warn('Failed to save docs', e);
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is required to take photos.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: false });
      if (res.canceled || res.cancelled) return;
      const asset = res.assets?.[0] || (res.uri ? { uri: res.uri } : null);
      if (!asset) return;
      // ensure fileName exists when possible
      if (!asset.fileName && asset.uri) asset.fileName = asset.uri.split('/').pop();
      setPendingFile(asset);
      setMeta({ title: asset.fileName || 'Photo', notes: '' });
      setShowMetaModal(true);
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Unable to open camera');
    }
  };

  const pickFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Media library permission is required to pick photos.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: false });
      if (res.canceled || res.cancelled) return;
      const asset = res.assets?.[0] || (res.uri ? { uri: res.uri } : null);
      if (!asset) return;
      if (!asset.fileName && asset.uri) asset.fileName = asset.uri.split('/').pop();
      setPendingFile(asset);
      setMeta({ title: asset.fileName || 'Photo', notes: '' });
      setShowMetaModal(true);
    } catch (e) {
      console.warn(e);
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
    setMeta({ title: '', notes: '' });
    setShowMetaModal(false);
  };

  const handleView = async (item) => {
    if (!item || !item.uri) return;
    try {
      await Linking.openURL(item.uri);
    } catch (e) {
      Alert.alert('Open failed', 'Unable to open the document on this device.');
    }
  };

  const handleDelete = (id) => {
    const entry = docs.find(d => d.id === id);
    if (!entry) return;
    Alert.alert('Delete Document', `Delete "${entry.title || 'document'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const next = docs.filter(d => d.id !== id);
        await saveDocs(next);
      } }
    ]);
  };

  const topPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : (insets.top || 20);

  return (
    <View style={{ flex: 1, backgroundColor: colors.light, paddingTop: topPadding }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} translucent={false} />
      <ScrollView contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'← Back'}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Important Documents</Text>
          <Text style={styles.subtitle}>Store photos or documents (e.g., IDs, insurance) locally. You can take a photo or choose from your library.</Text>

          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <TouchableOpacity style={[styles.actionButton, { marginRight: 8 }]} onPress={openCamera}>
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={pickFromLibrary}>
              <Text style={styles.actionButtonText}>Open Library</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={{ marginTop: 12, color: colors.muted }}>Loading…</Text>
          ) : docs.length === 0 ? (
            <Text style={{ marginTop: 12, color: colors.muted }}>No documents yet. Add one above.</Text>
          ) : (
            <FlatList
              data={docs}
              keyExtractor={i => i.id}
              style={{ marginTop: 12 }}
              renderItem={({ item }) => (
                <View style={styles.docRow}>
                  {item.type && item.type.startsWith('image') ? (
                    <Image source={{ uri: item.uri }} style={styles.thumb} />
                  ) : (
                    <View style={styles.thumbPlaceholder}><Text style={{ color: colors.muted }}>DOC</Text></View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.docTitle}>{item.title}</Text>
                    {item.notes ? <Text style={styles.docNotes}>{item.notes}</Text> : null}
                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                      <TouchableOpacity onPress={() => handleView(item)} style={[styles.iconButton, { marginRight: 8 }]}>
                        <Text style={styles.iconText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
                        <Text style={[styles.iconText, { color: '#EF4444' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>

      </ScrollView>

      <Modal visible={showMetaModal} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Document Details</Text>
                <Text style={styles.modalLabel}>Title</Text>
                <TextInput inputAccessoryViewID={'docAccessory'} placeholder="Title" value={meta.title} onChangeText={(t)=>setMeta(m=>({...m, title:t}))} style={styles.input} returnKeyType="next" onSubmitEditing={() => Keyboard.dismiss()} />
                <Text style={styles.modalLabel}>Notes</Text>
                <TextInput inputAccessoryViewID={'docAccessory'} placeholder="Notes" value={meta.notes} onChangeText={(t)=>setMeta(m=>({...m, notes:t}))} style={[styles.input, { height: 80 }]} multiline textAlignVertical="top" returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                  <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowMetaModal(false); setPendingFile(null); }} style={[styles.modalButton, { backgroundColor: '#E5E7EB' }]}>
                    <Text style={{ color: '#111', fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmSavePending} style={[styles.modalButton, { marginLeft: 8, backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={'docAccessory'}>
          <View style={styles.accessory}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.accessoryButton}>
              <Text style={styles.accessoryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 2 },
  title: { fontSize: 20, fontWeight: '800', color: colors.primary },
  subtitle: { color: colors.muted, marginTop: 6 },
  actionButton: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#F1FDF6', borderRadius: 8 },
  actionButtonText: { color: colors.primary, fontWeight: '700' },
  backButton: { marginBottom: 12, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#fff' },
  backButtonText: { color: colors.primary, fontWeight: '700' },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#F3F4F6' },
  thumbPlaceholder: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  docTitle: { fontWeight: '700', color: colors.secondary },
  docNotes: { color: colors.muted, marginTop: 4 },
  iconButton: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  iconText: { color: colors.primary, fontWeight: '700' },
  modalLabel: { marginTop: 12, fontWeight: '600', color: colors.secondary },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  modalTitle: { fontWeight: '800', fontSize: 18, marginBottom: 8, color: colors.primary },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginTop: 8, backgroundColor: '#fff' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  accessory: { backgroundColor: '#fff', padding: 8, borderTopWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'flex-end' },
  accessoryButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  accessoryText: { color: colors.primary, fontWeight: '700' }
});
