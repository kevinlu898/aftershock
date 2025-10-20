import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from "react";
import { Alert, InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../css";

const MED_KEY = 'medical_info';

export default function MedicalInfo({ navigation }) {
  const insets = useSafeAreaInsets();
  const [medicalList, setMedicalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMedForm, setShowMedForm] = useState(false);
  const [medForm, setMedForm] = useState({ name: '', medications: '', allergies: '', bloodType: '', notes: '' });
  const [editingMedId, setEditingMedId] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputAccessoryId = 'medAccessory';
  // refs for inputs so we can focus next field
  const nameRef = useRef(null);
  const medsRef = useRef(null);
  const allergiesRef = useRef(null);
  const bloodRef = useRef(null);
  const notesRef = useRef(null);
  const inputRefs = [nameRef, medsRef, allergiesRef, bloodRef, notesRef];
  const [currentFieldIndex, setCurrentFieldIndex] = useState(-1);

  const focusNext = (idx) => {
    const next = inputRefs[idx + 1];
    if (next && next.current && typeof next.current.focus === 'function') {
      next.current.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const rawMed = await AsyncStorage.getItem(MED_KEY);
        if (rawMed) {
          const parsed = JSON.parse(rawMed);
          if (Array.isArray(parsed)) setMedicalList(parsed);
          else if (parsed && typeof parsed === 'object') setMedicalList([parsed]);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
    // keyboard listeners for accessory on Android and tracking
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const saveMedicalList = async (next) => {
    try {
      await AsyncStorage.setItem(MED_KEY, JSON.stringify(next));
      setMedicalList(next);
    } catch (e) {
      console.warn('Failed to save medical info', e);
    }
  };

  const openMedicalEdit = (entry) => {
    if (entry) {
      setEditingMedId(entry.id);
      setMedForm({
        name: entry.name || '',
        medications: entry.medications || '',
        allergies: entry.allergies || '',
        bloodType: entry.bloodType || '',
        notes: entry.notes || ''
      });
    } else {
      setEditingMedId(null);
      setMedForm({ name: '', medications: '', allergies: '', bloodType: '', notes: '' });
    }
    setShowMedForm(true);
  };

  const handleSaveMedical = async () => {
    const nextEntry = {
      id: editingMedId || `m_${Date.now()}`,
      name: (medForm.name || '').trim(),
      medications: (medForm.medications || '').trim(),
      allergies: (medForm.allergies || '').trim(),
      bloodType: (medForm.bloodType || '').trim(),
      notes: (medForm.notes || '').trim(),
      updatedAt: new Date().toISOString()
    };

    let next;
    if (editingMedId) {
      next = medicalList.map(m => m.id === editingMedId ? nextEntry : m);
    } else {
      next = [nextEntry, ...medicalList];
    }
    await saveMedicalList(next);
    setShowMedForm(false);
    setEditingMedId(null);
  };

  const handleDeleteMed = (id) => {
    const entry = medicalList.find(m => m.id === id);
    if (!entry) return;
    Alert.alert('Delete Medical Entry', `Delete ${entry.name || 'this entry'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const next = medicalList.filter(m => m.id !== id);
          await saveMedicalList(next);
        }
      }
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
          <Text style={styles.title}>Medical Info</Text>
          <Text style={styles.subtitle}>Manage one or more medical records to share in an emergency. These are stored locally on this device.</Text>

          {loading ? (
            <Text style={{ marginTop: 12, color: colors.muted }}>Loading…</Text>
          ) : medicalList.length === 0 ? (
            <Text style={{ marginTop: 12, color: colors.muted }}>No medical information saved.</Text>
          ) : (
            <View style={{ marginTop: 12 }}>
              {medicalList.map((entry) => (
                <View key={entry.id} style={{ marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                  {entry.name ? <Text style={styles.medLabel}>{entry.name}</Text> : null}
                  {entry.medications ? <Text style={styles.medText}>Medications: {entry.medications}</Text> : null}
                  {entry.allergies ? <Text style={styles.medText}>Allergies: {entry.allergies}</Text> : null}
                  {entry.bloodType ? <Text style={styles.medText}>Blood Type: {entry.bloodType}</Text> : null}
                  {entry.notes ? <Text style={styles.medText}>{entry.notes}</Text> : null}
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <TouchableOpacity onPress={() => openMedicalEdit(entry)} style={[styles.iconButton, { marginRight: 8 }]}>
                      <Text style={styles.iconText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteMed(entry.id)} style={[styles.iconButton]}>
                      <Text style={[styles.iconText, { color: '#EF4444' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: colors.muted, marginTop: 6, fontSize: 12 }}>Last updated: {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : '—'}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={[styles.addButton, { marginTop: 12 }]} onPress={() => openMedicalEdit()}>
            <Text style={styles.addButtonText}>{'+ Add Medical Info'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Medical Info Modal */}
      <Modal visible={showMedForm} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{editingMedId ? 'Edit Medical Entry' : 'Add Medical Entry'}</Text>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }}>
                  <Text style={styles.modalLabel}>Name</Text>
                  <TextInput ref={nameRef} inputAccessoryViewID={inputAccessoryId} placeholder="Name" value={medForm.name} onChangeText={(t) => setMedForm(f => ({ ...f, name: t }))} style={styles.input} returnKeyType="next" onFocus={() => setCurrentFieldIndex(0)} onSubmitEditing={() => focusNext(0)} />
                  <Text style={styles.modalLabel}>Medications</Text>
                  <TextInput ref={medsRef} inputAccessoryViewID={inputAccessoryId} placeholder="Medications (comma-separated)" value={medForm.medications} onChangeText={(t) => setMedForm(f => ({ ...f, medications: t }))} style={[styles.input, { height: 80 }]} multiline textAlignVertical="top" onFocus={() => setCurrentFieldIndex(1)} />
                  <Text style={styles.modalLabel}>Allergies</Text>
                  <TextInput ref={allergiesRef} inputAccessoryViewID={inputAccessoryId} placeholder="Allergies" value={medForm.allergies} onChangeText={(t) => setMedForm(f => ({ ...f, allergies: t }))} style={[styles.input, { height: 60 }]} multiline textAlignVertical="top" onFocus={() => setCurrentFieldIndex(2)} />
                  <Text style={styles.modalLabel}>Blood Type</Text> 
                  <TextInput ref={bloodRef} inputAccessoryViewID={inputAccessoryId} placeholder="Blood Type" value={medForm.bloodType} onChangeText={(t) => setMedForm(f => ({ ...f, bloodType: t }))} style={styles.input} returnKeyType="next" onFocus={() => setCurrentFieldIndex(3)} onSubmitEditing={() => focusNext(3)} />
                  <Text style={styles.modalLabel}>Notes</Text>
                  <TextInput ref={notesRef} inputAccessoryViewID={inputAccessoryId} placeholder="Additional notes" value={medForm.notes} onChangeText={(t) => setMedForm(f => ({ ...f, notes: t }))} style={[styles.input, { height: 80 }]} multiline textAlignVertical="top" onFocus={() => setCurrentFieldIndex(4)} />
                </ScrollView>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                  <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowMedForm(false); setEditingMedId(null); }} style={[styles.modalButton, { backgroundColor: '#E5E7EB' }]}>
                    <Text style={{ color: '#111', fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSaveMedical} style={[styles.modalButton, { marginLeft: 8, backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* iOS InputAccessoryView */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryId}>
          <View style={styles.accessory}>
            <TouchableOpacity onPress={() => { if (currentFieldIndex >= 0) focusNext(currentFieldIndex); }} style={[styles.accessoryButton, { marginRight: 8 }]}>
              <Text style={styles.accessoryText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.accessoryButton}>
              <Text style={styles.accessoryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      {/* Android floating accessory (shown when keyboard visible) */}
      {Platform.OS === 'android' && keyboardVisible && (
        <View style={[styles.androidAccessory, { bottom: keyboardHeight }]} pointerEvents="box-none">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => { if (currentFieldIndex >= 0) focusNext(currentFieldIndex); }} style={[styles.accessoryButtonAndroid, { marginRight: 8 }]}>
              <Text style={{ color: '#111', fontWeight: '700' }}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.accessoryButtonAndroid}>
              <Text style={{ color: '#111', fontWeight: '700' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 2
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.primary },
  subtitle: { color: colors.muted, marginTop: 6 },
  addButton: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#F1FDF6', borderRadius: 8, alignSelf: 'flex-start' },
  addButtonText: { color: colors.primary, fontWeight: '700' },
  backButton: { marginBottom: 12, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#fff' },
  backButtonText: { color: colors.primary, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  modalTitle: { fontWeight: '800', fontSize: 18, marginBottom: 8, color: colors.primary },
  modalLabel: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: colors.secondary,
    fontSize: 14,
  },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginTop: 8, backgroundColor: '#fff' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  medLabel: { fontWeight: '700', color: colors.secondary, marginTop: 12 },
  medText: { color: colors.muted, marginTop: 4, marginBottom: 12 },
  accessory: { backgroundColor: '#fff', padding: 8, borderTopWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'flex-end' },
  accessoryButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  accessoryText: { color: colors.primary, fontWeight: '700' },
  androidAccessory: { position: 'absolute', left: 0, right: 0, zIndex: 1000, alignItems: 'flex-end', padding: 16 },
  accessoryButtonAndroid: { backgroundColor: '#F1FDF6', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  iconButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F3F4F6' },
  iconText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
