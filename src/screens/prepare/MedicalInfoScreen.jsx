import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Keyboard, Modal, Platform, SafeAreaView, ScrollView, StatusBar, Text, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addDoc, collection, deleteDoc, doc, query as fsQuery, getDocs, updateDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { getData } from '../../lib/storage/storageUtils';
const MED_KEY = 'medical_info';
export default function MedicalInfo({
  navigation
}) {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top || 20;
  const screenHeight = typeof Dimensions !== 'undefined' && Dimensions.get && typeof Dimensions.get === 'function' ? Dimensions.get('window').height : 800;
  const MODAL_MAX = Math.min(screenHeight * 0.85, 760);
  const MODAL_HEADER_H = 56;
  const MODAL_FOOTER_H = 64;
  const modalContentMaxHeight = MODAL_MAX - MODAL_HEADER_H - MODAL_FOOTER_H;
  const [medicalList, setMedicalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMedForm, setShowMedForm] = useState(false);
  const [medForm, setMedForm] = useState({
    name: '',
    medications: '',
    allergies: '',
    bloodType: '',
    notes: ''
  });
  const [editingMedId, setEditingMedId] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const nameRef = useRef(null);
  const medsRef = useRef(null);
  const allergiesRef = useRef(null);
  const bloodRef = useRef(null);
  const notesRef = useRef(null);
  const inputRefs = [nameRef, medsRef, allergiesRef, bloodRef, notesRef];
  const modalScrollRef = useRef(null);
  const [, setActiveInputRef] = useState(null);
  const focusNext = idx => {
    const next = inputRefs[idx + 1];
    if (next && next.current && typeof next.current.focus === 'function') {
      next.current.focus();
    } else {
      Keyboard.dismiss();
    }
  };
  const handleInputFocus = (ref, index) => {
    setActiveInputRef(ref);
    setTimeout(() => {
      if (modalScrollRef.current && keyboardVisible) {
        const scrollPosition = index * 120;
        modalScrollRef.current.scrollTo({
          y: scrollPosition,
          animated: true
        });
      }
    }, 100);
  };

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const rawMed = await AsyncStorage.getItem(MED_KEY);
        if (rawMed) {
          const parsed = JSON.parse(rawMed);
          if (Array.isArray(parsed)) setMedicalList(parsed);else if (parsed && typeof parsed === 'object') setMedicalList([parsed]);
        } else {
          try {
            const username = (await getData('username')) || null;
            if (username) {
              const q = fsQuery(collection(db, 'emergencyData'), where('username', '==', username), where('dataType', '==', 'medical'));
              const snaps = await getDocs(q);
              if (!snaps.empty) {
                const fromDb = snaps.docs.map(d => {
                  const payload = d.data()?.data || {};
                  return {
                    id: d.id,
                    name: payload.name || payload.Name || '',
                    medications: payload.medications || payload.Medications || '',
                    allergies: payload.allergies || payload.Allergies || '',
                    bloodType: payload.bloodType || payload.BloodType || '',
                    notes: payload.notes || payload.Notes || '',
                    updatedAt: payload.updatedAt || null
                  };
                });
                if (fromDb.length) {
                  setMedicalList(fromDb);
                  try {
                    await AsyncStorage.setItem(MED_KEY, JSON.stringify(fromDb));
                  } catch (_) {}
                }
              }
            }
          } catch (dbErr) {
            console.warn('medicalInfo: failed to load from firestore', dbErr);
          }
        }
      } catch (_error) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
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

  // Save data
  const saveMedicalList = async next => {
    try {
      const username = (await getData('username')) || 'unknown';
      const finalList = [];
      for (const entry of next || []) {
        const dataObj = {
          name: entry.name || '',
          medications: entry.medications || '',
          allergies: entry.allergies || '',
          bloodType: entry.bloodType || '',
          notes: entry.notes || '',
          updatedAt: new Date().toISOString()
        };
        if (String(entry.id).startsWith('m_')) {
          try {
            const docRef = await addDoc(collection(db, 'emergencyData'), {
              data: dataObj,
              dataType: 'medical',
              username
            });
            finalList.push({
              ...entry,
              id: docRef.id,
              updatedAt: dataObj.updatedAt
            });
          } catch (e) {
            console.warn('medicalInfo: failed to add new doc to firestore', e);
            finalList.push(entry);
          }
        } else {
          try {
            const remoteRef = doc(db, 'emergencyData', entry.id);
            await updateDoc(remoteRef, {
              data: dataObj
            });
            finalList.push({
              ...entry,
              updatedAt: dataObj.updatedAt
            });
          } catch (e) {
            console.warn('medicalInfo: failed to update remote doc', e);
            finalList.push(entry);
          }
        }
      }
      try {
        await AsyncStorage.setItem(MED_KEY, JSON.stringify(finalList));
        setMedicalList(finalList);
      } catch (e) {
        console.warn('medicalInfo: failed to persist locally', e);
        setMedicalList(next);
      }
    } catch (e) {
      console.warn('Failed to save medical info', e);
    }
  };
  const openMedicalEdit = entry => {
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
      setMedForm({
        name: '',
        medications: '',
        allergies: '',
        bloodType: '',
        notes: ''
      });
    }
    setShowMedForm(true);
  };

  // Delete 
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
    setActiveInputRef(null);
  };
  const handleDeleteMed = id => {
    const entry = medicalList.find(m => m.id === id);
    if (!entry) return;
    Alert.alert('Delete Medical Entry', `Delete ${entry.name || 'this entry'}?`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          if (!String(id).startsWith('m_')) {
            await deleteDoc(doc(db, 'emergencyData', id));
          }
        } catch (e) {
          console.warn('medicalInfo: failed to delete remote doc', e);
        }
        const next = medicalList.filter(m => m.id !== id);
        await saveMedicalList(next);
      }
    }]);
  };
  const handleCancel = () => {
    Keyboard.dismiss();
    setShowMedForm(false);
    setEditingMedId(null);
    setActiveInputRef(null);
  };
  return <SafeAreaView className="flex-1 bg-background">
      <View className={["absolute top-0 left-0 right-0 bg-background z-[1000]"].filter(Boolean).join(" ")} style={{
      height: statusBarHeight
    }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          

          <ScrollView contentContainerClassName="p-[18px]" keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
            <Button unstyled onPress={() => navigation?.goBack?.()} className={"mb-[12px] self-start py-[8px] px-[12px] rounded-[10px] bg-card"}>
              <Text className={"text-primary font-bold"}>{'← Back'}</Text>
            </Button>

            <View className={"bg-card p-[16px] rounded-[12px] mb-[12px] shadow-sm"}>
              <Text className={"text-[20px] font-extrabold text-primary"}>Medical Info</Text>
              <Text className={"text-muted-foreground mt-[6px]"}>
                Manage one or more medical records to share in an emergency. These are stored locally on this device.
              </Text>

              <Button unstyled className={["mt-[12px] py-[10px] px-[12px] bg-secondary rounded-[8px] self-start", "mt-[12px]"].filter(Boolean).join(" ")} onPress={() => openMedicalEdit()}>
                <Text className={"text-primary font-bold"}>{'+ Add Medical Info'}</Text>
              </Button>

              {loading ? <Text className="mt-[12px] text-muted-foreground">Loading…</Text> : medicalList.length === 0 ? <Text className="mt-[12px] text-muted-foreground">No medical information saved.</Text> : <View className="mt-[12px]">
                  <ScrollView style={{
                maxHeight: Math.round(screenHeight * 0.55)
              }} nestedScrollEnabled contentContainerClassName="pb-[8px]">
                    {medicalList.map(entry => <View key={entry.id} className="mb-[12px] pb-[8px] border-b border-border">
                        {entry.name && <Text className={"font-bold text-secondary-foreground mt-[12px]"}>{entry.name}</Text>}
                        {entry.medications && <Text className={"text-muted-foreground mt-[4px] mb-[12px]"}>Medications: {entry.medications}</Text>}
                        {entry.allergies && <Text className={"text-muted-foreground mt-[4px] mb-[12px]"}>Allergies: {entry.allergies}</Text>}
                        {entry.bloodType && <Text className={"text-muted-foreground mt-[4px] mb-[12px]"}>Blood Type: {entry.bloodType}</Text>}
                        {entry.notes && <Text className={"text-muted-foreground mt-[4px] mb-[12px]"}>{entry.notes}</Text>}
                        <View className="flex-row mt-[8px]">
                          <Button unstyled onPress={() => openMedicalEdit(entry)} className={["py-[8px] px-[12px] rounded-[8px] bg-muted", "mr-[8px]"].filter(Boolean).join(" ")}>
                            <Text className={"text-primary font-semibold text-[14px]"}>Edit</Text>
                          </Button>
                          <Button unstyled onPress={() => handleDeleteMed(entry.id)} className={"py-[8px] px-[12px] rounded-[8px] bg-muted"}>
                            <Text className={["text-primary font-semibold text-[14px]", "text-destructive"].filter(Boolean).join(" ")}>Delete</Text>
                          </Button>
                        </View>
                        <Text className="text-muted-foreground mt-[6px] text-[12px]">
                          Last updated: {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : '—'}
                        </Text>
                      </View>)}
                  </ScrollView>
                </View>}
            </View>
          </ScrollView>

          <Modal visible={showMedForm} animationType="slide" transparent>
            <View className={"flex-1 justify-end bg-[rgba(0,0,0,0.35)]"}>
              <View className={["bg-card p-[16px] rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] rounded-br-[12px]", "m-[16px]"].filter(Boolean).join(" ")} style={{
              marginBottom: keyboardVisible ? keyboardHeight + 8 : 16,
              maxHeight: MODAL_MAX - 275
            }}>
                <View className={"pb-[8px] border-b border-border mb-[6px]"}>
                  <Text className={"font-extrabold text-[18px] mb-[8px] text-primary"}>
                    {editingMedId ? 'Edit Medical Info' : 'Add Medical Info'}
                  </Text>
                </View>
                <ScrollView ref={modalScrollRef} style={{
                maxHeight: modalContentMaxHeight - 120
              }} contentContainerClassName="pb-[12px] px-0" keyboardShouldPersistTaps="handled">
                  <Text className={"font-semibold mt-[12px] mb-[4px] text-secondary-foreground text-[14px]"}>Name</Text>
                  <Input ref={nameRef} value={medForm.name} onChangeText={t => setMedForm(p => ({
                  ...p,
                  name: t
                }))} className={"border border-border rounded-[8px] p-[10px] mt-[8px] bg-card"} returnKeyType="next" onSubmitEditing={() => focusNext(0)} onFocus={() => handleInputFocus(nameRef, 0)} />

                  <Text className={"font-semibold mt-[12px] mb-[4px] text-secondary-foreground text-[14px]"}>Medications</Text>
                  <Input ref={medsRef} value={medForm.medications} onChangeText={t => setMedForm(p => ({
                  ...p,
                  medications: t
                }))} className={"border border-border rounded-[8px] p-[10px] mt-[8px] bg-card"} returnKeyType="next" onSubmitEditing={() => focusNext(1)} onFocus={() => handleInputFocus(medsRef, 1)} />

                  <Text className={"font-semibold mt-[12px] mb-[4px] text-secondary-foreground text-[14px]"}>Allergies</Text>
                  <Input ref={allergiesRef} value={medForm.allergies} onChangeText={t => setMedForm(p => ({
                  ...p,
                  allergies: t
                }))} className={"border border-border rounded-[8px] p-[10px] mt-[8px] bg-card"} returnKeyType="next" onSubmitEditing={() => focusNext(2)} onFocus={() => handleInputFocus(allergiesRef, 2)} />

                  <Text className={"font-semibold mt-[12px] mb-[4px] text-secondary-foreground text-[14px]"}>Blood Type</Text>
                  <Input ref={bloodRef} value={medForm.bloodType} onChangeText={t => setMedForm(p => ({
                  ...p,
                  bloodType: t
                }))} className={"border border-border rounded-[8px] p-[10px] mt-[8px] bg-card"} returnKeyType="next" onSubmitEditing={() => focusNext(3)} onFocus={() => handleInputFocus(bloodRef, 3)} />

                  <Text className={"font-semibold mt-[12px] mb-[4px] text-secondary-foreground text-[14px]"}>Notes</Text>
                  <Input ref={notesRef} value={medForm.notes} onChangeText={t => setMedForm(p => ({
                  ...p,
                  notes: t
                }))} className={["border border-border rounded-[8px] p-[10px] mt-[8px] bg-card", "min-h-[80px] align-top"].filter(Boolean).join(" ")} multiline numberOfLines={4} returnKeyType="done" onFocus={() => handleInputFocus(notesRef, 4)} />
                </ScrollView>
                <View className={"border-t border-border pt-[10px] pb-[8px] mt-[8px]"}>
                  <View className="flex-row justify-end w-[100%]">
                    <Button unstyled onPress={handleCancel} className={["py-[10px] px-[14px] rounded-[10px]", "bg-muted"].filter(Boolean).join(" ")}>
                      <Text className="text-foreground font-bold">Cancel</Text>
                    </Button>
                    <Button unstyled onPress={handleSaveMedical} className={["py-[10px] px-[14px] rounded-[10px]", "ml-[8px] bg-primary"].filter(Boolean).join(" ")}>
                      <Text className="text-primary-foreground font-bold">Save</Text>
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>;
}
