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
import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, Modal, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { addDoc, collection, deleteDoc, doc, query as fsQuery, getDocs, updateDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { getData } from '../../lib/storage/storageUtils';
const MED_KEY = 'medical_info';
export default function MedicalInfo({
  navigation
}) {
  const { height: screenHeight } = useWindowDimensions();
  const MODAL_MAX = Math.min(screenHeight * 0.85, 760);
  const MODAL_HEADER_H = 56;
  const MODAL_FOOTER_H = 64;
  const modalContentMaxHeight = MODAL_MAX - MODAL_HEADER_H - MODAL_FOOTER_H;
  const [medicalList, setMedicalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
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
        setLoadError("Your medical information could not be loaded.");
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
  const detailsFor = entry => [
    { label: "Medications", value: entry.medications },
    { label: "Allergies", value: entry.allergies },
    { label: "Notes", value: entry.notes }
  ].filter(detail => detail.value);

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
              <AppIcon name="medical-bag" size={26} className="text-primary" />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-lg font-bold text-foreground">Critical details, together</Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                {medicalList.length === 0
                  ? "Keep essential health information easy to find."
                  : `${medicalList.length} ${medicalList.length === 1 ? "medical profile" : "medical profiles"} saved.`}
              </Text>
            </View>
          </View>
          <Button className="min-h-12 rounded-xl" onPress={() => openMedicalEdit()}>
            <AppIcon name="plus" size={19} className="text-primary-foreground" />
            <Text className="text-base font-bold text-primary-foreground">Add medical profile</Text>
          </Button>
        </Card>

        <View className="gap-3">
          <SectionHeader
            title="Medical profiles"
            description="Information to reference or share in an emergency."
          />
          {loading ? (
            showSkeleton ? <SkeletonList count={3} /> : <View className="h-40" />
          ) : loadError ? (
            <StatusCard tone="danger" title="Medical information unavailable" description={loadError} />
          ) : medicalList.length === 0 ? (
            <EmptyState
              className="bg-card"
              title="No medical information saved"
              description="Add medications, allergies, blood type, or care notes."
            >
              <View className="mt-5 h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <AppIcon name="medical-bag" size={22} className="text-primary" />
              </View>
            </EmptyState>
          ) : (
            <View className="gap-3">
              {medicalList.map(entry => (
                <Card key={entry.id} className="gap-4 p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary" style={{ borderCurve: "continuous" }}>
                      <AppIcon name="medical-bag" size={20} className="text-primary" />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text selectable className="text-[17px] font-bold leading-[22px] text-foreground">
                        {entry.name || "Unnamed profile"}
                      </Text>
                      <Text className="mt-0.5 text-xs text-muted-foreground">
                        Updated {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString() : "date unavailable"}
                      </Text>
                    </View>
                    {entry.bloodType ? (
                      <View className="rounded-full bg-secondary px-3 py-1.5">
                        <Text selectable className="text-xs font-extrabold text-primary">{entry.bloodType}</Text>
                      </View>
                    ) : null}
                  </View>

                  {detailsFor(entry).length ? (
                    <View className="overflow-hidden rounded-xl border border-border" style={{ borderCurve: "continuous" }}>
                      {detailsFor(entry).map((detail, index, list) => (
                        <View
                          key={detail.label}
                          className={[
                            "gap-1 px-4 py-3",
                            index < list.length - 1 && "border-b border-border"
                          ].filter(Boolean).join(" ")}
                        >
                          <Text className="text-xs font-semibold text-muted-foreground">{detail.label}</Text>
                          <Text selectable className="text-[15px] leading-5 text-foreground">{detail.value}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View className="rounded-xl bg-muted px-4 py-3">
                      <Text className="text-sm text-muted-foreground">No additional medical details saved.</Text>
                    </View>
                  )}

                  <View className="flex-row gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" onPress={() => openMedicalEdit(entry)}>
                      <AppIcon name="pencil" size={16} className="text-primary" />
                      <Text className="font-bold text-primary">Edit</Text>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onPress={() => handleDeleteMed(entry.id)}>
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

      <Modal visible={showMedForm} animationType="slide" transparent onRequestClose={handleCancel}>
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="rounded-t-[28px] border border-border bg-card px-5 pb-6 pt-3"
            style={{
              marginBottom: keyboardVisible ? keyboardHeight : 0,
              maxHeight: MODAL_MAX,
              borderCurve: "continuous"
            }}
          >
            <View className="mb-4 h-1.5 w-10 self-center rounded-full bg-border" />
            <View className="mb-5 gap-1">
              <Text className="text-xl font-extrabold text-foreground">
                {editingMedId ? 'Edit medical profile' : 'New medical profile'}
              </Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                Record only the information that would help during an emergency.
              </Text>
            </View>
            <ScrollView
              ref={modalScrollRef}
              style={{ maxHeight: modalContentMaxHeight }}
              contentContainerClassName="gap-4 pb-2"
              keyboardShouldPersistTaps="handled"
            >
              <FormField label="Name">
                <Input ref={nameRef} placeholder="Person's name" value={medForm.name} onChangeText={t => setMedForm(p => ({
                  ...p,
                  name: t
                }))} returnKeyType="next" onSubmitEditing={() => focusNext(0)} onFocus={() => handleInputFocus(nameRef, 0)} />
              </FormField>
              <FormField label="Medications">
                <Input ref={medsRef} placeholder="Medication and dosage" value={medForm.medications} onChangeText={t => setMedForm(p => ({
                  ...p,
                  medications: t
                }))} returnKeyType="next" onSubmitEditing={() => focusNext(1)} onFocus={() => handleInputFocus(medsRef, 1)} />
              </FormField>
              <FormField label="Allergies">
                <Input ref={allergiesRef} placeholder="Medication, food, or other allergies" value={medForm.allergies} onChangeText={t => setMedForm(p => ({
                  ...p,
                  allergies: t
                }))} returnKeyType="next" onSubmitEditing={() => focusNext(2)} onFocus={() => handleInputFocus(allergiesRef, 2)} />
              </FormField>
              <FormField label="Blood type">
                <Input ref={bloodRef} placeholder="Example: O+" value={medForm.bloodType} onChangeText={t => setMedForm(p => ({
                  ...p,
                  bloodType: t
                }))} returnKeyType="next" onSubmitEditing={() => focusNext(3)} onFocus={() => handleInputFocus(bloodRef, 3)} />
              </FormField>
              <FormField label="Care notes">
                <Input ref={notesRef} placeholder="Conditions, equipment, or other instructions" value={medForm.notes} onChangeText={t => setMedForm(p => ({
                  ...p,
                  notes: t
                }))} className="min-h-[96px]" multiline numberOfLines={4} returnKeyType="done" onFocus={() => handleInputFocus(notesRef, 4)} />
              </FormField>
            </ScrollView>
            <View className="mt-5 flex-row gap-3">
              <Button variant="secondary" className="flex-1" onPress={handleCancel}>
                <Text className="font-bold text-secondary-foreground">Cancel</Text>
              </Button>
              <Button className="flex-1" onPress={handleSaveMedical}>
                <Text className="font-bold text-primary-foreground">Save profile</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>;
}
