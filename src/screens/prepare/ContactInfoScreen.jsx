import { Button } from "../../components/ui/button";
import { AppIcon } from "../../components/app-icon";
import { EmptyState, StatusCard } from "../../components/app-ui";
import { Input } from "../../components/ui/input";
import {
  SkeletonList,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, deleteDoc, doc, query as fsQuery, getDocs, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TouchableWithoutFeedback, useWindowDimensions, View } from "react-native";
import { db } from '../../lib/firebaseConfig';
import { getData } from '../../lib/storage/storageUtils';
const STORAGE_KEY = 'emergency_contacts';
export default function EmergencyContacts({
  navigation
}) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    relation: ''
  });
  const { height: screenHeight } = useWindowDimensions();
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const relationRef = useRef(null);

  // Load data from AsyncStorage and Firebase
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setContacts(JSON.parse(raw));
        } else {
          try {
            const username = (await getData('username')) || null;
            if (username) {
              const q = fsQuery(collection(db, 'emergencyData'), where('username', '==', username), where('dataType', '==', 'contacts'));
              const snaps = await getDocs(q);
              if (!snaps.empty) {
                const fromDb = snaps.docs.map(doc => {
                  const d = doc.data()?.data || {};
                  return {
                    id: doc.id,
                    name: d.name || '',
                    phone: d.phone || '',
                    relation: d.relation || ''
                  };
                });
                if (fromDb.length) {
                  setContacts(fromDb);
                  try {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fromDb));
                  } catch (_) {}
                }
              }
            }
          } catch (dbErr) {
            console.warn('contacts: failed to load from firestore', dbErr);
          }
        }
      } catch (_error) {
        setLoadError("Your emergency contacts could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Save data to AsyncStorage and Firebase
  const save = async next => {
    try {
      const username = (await getData('username')) || 'unknown';
      const finalContacts = [];
      for (const c of next || []) {
        const dataObj = {
          name: c.name || '',
          phone: c.phone || '',
          relation: c.relation || '',
          blank1: '',
          blank2: ''
        };
        if (String(c.id).startsWith('c_')) {
          try {
            const docRef = await addDoc(collection(db, 'emergencyData'), {
              data: dataObj,
              dataType: 'contacts',
              username
            });
            finalContacts.push({
              ...c,
              id: docRef.id
            });
          } catch (e) {
            console.warn('contacts: failed to add new contact to firestore', e);
            finalContacts.push(c);
          }
        } else {
          try {
            const remoteRef = doc(db, 'emergencyData', c.id);
            await updateDoc(remoteRef, {
              data: dataObj
            });
            finalContacts.push(c);
          } catch (e) {
            console.warn('contacts: failed to update contact in firestore', e);
            finalContacts.push(c);
          }
        }
      }
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalContacts));
      } catch (_e) {
        // ignore
      }
      setContacts(finalContacts);
    } catch (e) {
      console.warn('Failed to save contacts', e);
    }
  };
  const openAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      phone: '',
      relation: ''
    });
    setShowForm(true);
  };
  const openEdit = c => {
    setEditingId(c.id);
    setForm({
      name: c.name || '',
      phone: c.phone || '',
      relation: c.relation || ''
    });
    setShowForm(true);
  };

  // Delete contacts
  const handleDelete = id => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    Alert.alert('Delete Contact', `Delete ${contact.name || 'this contact'}?`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        const next = contacts.filter(c => c.id !== id);
        try {
          if (!String(id).startsWith('c_')) {
            await deleteDoc(doc(db, 'emergencyData', id));
          }
        } catch (e) {
          console.warn('contacts: failed to delete remote doc', e);
        }
        await save(next);
      }
    }]);
  };

  // Add contacts
  const handleSaveForm = async () => {
    const name = (form.name || '').trim();
    const phone = (form.phone || '').trim();
    const relation = (form.relation || '').trim();
    if (!name || !phone) {
      Alert.alert('Validation', 'Please provide at least a name and phone number.');
      return;
    }
    if (editingId) {
      const next = contacts.map(c => c.id === editingId ? {
        ...c,
        name,
        phone,
        relation
      } : c);
      await save(next);
    } else {
      const newContact = {
        id: `c_${Date.now()}`,
        name,
        phone,
        relation
      };
      const next = [newContact, ...contacts];
      await save(next);
    }
    setShowForm(false);
  };
  return <View className="flex-1 bg-background">
      
      <ScrollView contentContainerClassName="p-[20px]" contentInsetAdjustmentBehavior="automatic">
        <View className={"bg-card p-[20px] rounded-[16px] mb-[12px] shadow-sm border border-border"}>
          <Text className={"text-muted-foreground mt-[6px]"}>Add people to call or text during an emergency. These are saved to your account.</Text>

          <Button unstyled className={"mt-[12px] py-[10px] px-[12px] bg-secondary rounded-[8px] self-start"} onPress={openAdd}>
            <View className="flex-row items-center gap-2">
              <AppIcon name="plus" size={17} className="text-primary" />
              <Text className={"text-primary font-bold"}>Add Contact</Text>
            </View>
          </Button>

          {loading ? showSkeleton ? <SkeletonList count={3} className="mt-4" /> : <View className="h-40" /> : loadError ? <StatusCard className="mt-4" tone="danger" title="Contacts unavailable" description={loadError} /> : contacts.length === 0 ? <EmptyState className="mt-4 bg-muted/40" title="No contacts yet" description="Add someone you can call or text during an emergency." /> : <FlatList data={contacts} keyExtractor={item => item.id} className="mt-[12px]" renderItem={({
          item
        }) => <View className={"flex-row items-center py-[12px] border-b border-border"}>
                  <View className="flex-1">
                    <Text className={"font-bold text-secondary-foreground text-[16px]"}>{item.name}</Text>
                    <Text className={"text-muted-foreground mt-[4px]"}>{item.relation || 'Contact'} • {item.phone}</Text>
                  </View>
                  <View className={"flex-row ml-[12px]"}>
                    <Button unstyled onPress={() => openEdit(item)} className={"py-[6px] px-[8px] rounded-[8px] bg-card border border-border"}>
                      <Text className={"text-primary font-bold"}>Edit</Text>
                    </Button>
                    <Button unstyled onPress={() => handleDelete(item.id)} className={["py-[6px] px-[8px] rounded-[8px] bg-card border border-border", "ml-[8px]"].filter(Boolean).join(" ")}>
                      <Text className={["text-primary font-bold", "text-destructive"].filter(Boolean).join(" ")}>Delete</Text>
                    </Button>
                  </View>
                </View>} />}
        </View>

      </ScrollView>

      <Modal visible={showForm} animationType="fade" transparent>
        <TouchableWithoutFeedback>
          <View className={"flex-1 justify-end bg-[rgba(0,0,0,0.35)]"}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
              <View className={["bg-card p-[16px] rounded-[12px] self-stretch", "mx-[16px]"].filter(Boolean).join(" ")} style={{
              maxHeight: Math.round(screenHeight * 0.45)
            }}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="pb-[8px]">
                  <Text className={"font-extrabold text-[18px] mt-[8px] mb-[8px] text-primary"}>{editingId ? 'Edit Contact' : 'New Contact'}</Text>
                  <Text className={"font-semibold mt-[12px] mb-[4px] text-secondary-foreground text-[14px]"}>Name</Text>
                  <Input ref={nameRef} placeholder="Name" value={form.name} onChangeText={t => setForm(f => ({
                  ...f,
                  name: t
                }))} className={"border border-border rounded-[8px] p-[10px] mt-[8px] bg-card"} returnKeyType="next" onSubmitEditing={() => {
                  phoneRef.current?.focus?.();
                }} />
                  <Text className={"font-semibold mt-[12px] mb-[4px] text-secondary-foreground text-[14px]"}>Phone Number</Text>
                  <Input ref={phoneRef} placeholder="Phone" value={form.phone} onChangeText={t => setForm(f => ({
                  ...f,
                  phone: t
                }))} className={"border border-border rounded-[8px] p-[10px] mt-[8px] bg-card"} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={() => {
                  relationRef.current?.focus?.();
                }} />
                  <Text className={"font-semibold mt-[12px] mb-[4px] text-secondary-foreground text-[14px]"}>Relation</Text>
                  <Input ref={relationRef} placeholder="Relation (optional)" value={form.relation} onChangeText={t => setForm(f => ({
                  ...f,
                  relation: t
                }))} className={"border border-border rounded-[8px] p-[10px] mt-[8px] bg-card"} returnKeyType="done" blurOnSubmit={true} onSubmitEditing={() => {/* close keyboard */}} />
                </ScrollView>

                <View className="border-t border-border pt-[8px]">
                  <View className="flex-row justify-end">
                    <Button unstyled onPress={() => {
                    setShowForm(false);
                  }} className={["py-[10px] px-[14px] rounded-[10px]", "bg-muted"].filter(Boolean).join(" ")}>
                      <Text className="text-foreground font-bold">Cancel</Text>
                    </Button>
                    <Button unstyled onPress={handleSaveForm} className={["py-[10px] px-[14px] rounded-[10px]", "ml-[8px] bg-primary"].filter(Boolean).join(" ")}>
                      <Text className="text-primary-foreground font-bold">Save</Text>
                    </Button>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>;
}
