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
import { addDoc, collection, deleteDoc, doc, query as fsQuery, getDocs, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, useWindowDimensions, View } from "react-native";
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
      <ScrollView
        contentContainerClassName="gap-6 px-5 py-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Card className="gap-5 overflow-hidden p-5">
          <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-secondary" style={{ borderCurve: "continuous" }}>
              <AppIcon name="phone" size={26} className="text-primary" />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-lg font-bold text-foreground">Your call list</Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                {contacts.length === 0
                  ? "Keep trusted people close when every minute matters."
                  : `${contacts.length} ${contacts.length === 1 ? "person" : "people"} ready to contact.`}
              </Text>
            </View>
          </View>
          <Button className="min-h-12 rounded-xl" onPress={openAdd}>
            <AppIcon name="plus" size={19} className="text-primary-foreground" />
            <Text className="text-base font-bold text-primary-foreground">Add contact</Text>
          </Button>
        </Card>

        <View className="gap-3">
          <SectionHeader
            title="Emergency contacts"
            description="Saved to your account and available here."
          />
          {loading ? (
            showSkeleton ? <SkeletonList count={3} /> : <View className="h-40" />
          ) : loadError ? (
            <StatusCard tone="danger" title="Contacts unavailable" description={loadError} />
          ) : contacts.length === 0 ? (
            <EmptyState
              className="bg-card"
              title="No contacts yet"
              description="Add the people you would call or text first."
            >
              <View className="mt-5 h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <AppIcon name="account" size={22} className="text-primary" />
              </View>
            </EmptyState>
          ) : (
            <View className="gap-3">
              {contacts.map(item => (
                <Card key={item.id} className="gap-4 p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
                      <Text className="text-base font-extrabold text-primary">
                        {(item.name || "?").trim().charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="min-w-0 flex-1 gap-0.5">
                      <Text selectable className="text-[17px] font-bold leading-[22px] text-foreground">
                        {item.name}
                      </Text>
                      <Text className="text-[13px] font-medium text-muted-foreground">
                        {item.relation || "Emergency contact"}
                      </Text>
                    </View>
                  </View>
                  <View className="rounded-xl bg-muted px-4 py-3" style={{ borderCurve: "continuous" }}>
                    <Text className="text-xs font-semibold text-muted-foreground">Phone number</Text>
                    <Text selectable className="mt-1 text-base font-semibold text-foreground">
                      {item.phone}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" onPress={() => openEdit(item)}>
                      <AppIcon name="pencil" size={16} className="text-primary" />
                      <Text className="font-bold text-primary">Edit</Text>
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

      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View
              className="rounded-t-[28px] border border-border bg-card px-5 pb-6 pt-3"
              style={{ maxHeight: Math.round(screenHeight * 0.78), borderCurve: "continuous" }}
            >
              <View className="mb-4 h-1.5 w-10 self-center rounded-full bg-border" />
              <View className="mb-5 gap-1">
                <Text className="text-xl font-extrabold text-foreground">
                  {editingId ? 'Edit contact' : 'New contact'}
                </Text>
                <Text className="text-sm leading-5 text-muted-foreground">
                  Add the details you will need during an emergency.
                </Text>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4">
                <FormField label="Name">
                  <Input ref={nameRef} placeholder="Full name" value={form.name} onChangeText={t => setForm(f => ({
                    ...f,
                    name: t
                  }))} returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus?.()} />
                </FormField>
                <FormField label="Phone number">
                  <Input ref={phoneRef} placeholder="Phone number" value={form.phone} onChangeText={t => setForm(f => ({
                    ...f,
                    phone: t
                  }))} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={() => relationRef.current?.focus?.()} />
                </FormField>
                <FormField label="Relationship" description="Optional">
                  <Input ref={relationRef} placeholder="Family, neighbor, friend" value={form.relation} onChangeText={t => setForm(f => ({
                    ...f,
                    relation: t
                  }))} returnKeyType="done" blurOnSubmit />
                </FormField>
              </ScrollView>
              <View className="mt-6 flex-row gap-3">
                <Button variant="secondary" className="flex-1" onPress={() => setShowForm(false)}>
                  <Text className="font-bold text-secondary-foreground">Cancel</Text>
                </Button>
                <Button className="flex-1" onPress={handleSaveForm}>
                  <Text className="font-bold text-primary-foreground">Save contact</Text>
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>;
}
