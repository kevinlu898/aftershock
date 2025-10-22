import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, deleteDoc, doc, query as fsQuery, getDocs, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, FlatList, Keyboard, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../css";
import { db } from '../../db/firebaseConfig';
import { getData } from '../../storage/storageUtils';

const STORAGE_KEY = 'emergency_contacts';

export default function EmergencyContacts({ navigation }) {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', relation: '' });

  // keyboard-aware modal helpers
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const screenHeight = Dimensions.get('window').height;

  // refs for modal and inputs so we can scroll focused input into view
  const modalScrollRef = useRef(null);
  const modalCardRef = useRef(null);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const relationRef = useRef(null);

  useEffect(() => {
    const onShow = (e) => setKeyboardHeight(e.endCoordinates?.height || 0);
    const onHide = () => setKeyboardHeight(0);
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Scroll the modal ScrollView so the focused input is visible inside modalCard
  const scrollInputIntoView = (inputRef) => {
    setTimeout(() => {
      try {
        const input = inputRef.current;
        const card = modalCardRef.current;
        const scroller = modalScrollRef.current;
        if (!input || !card || !scroller) return;
        input.measureLayout(card, (left, top, width, height) => {
          // scroll a bit above the input
          const scrollTo = Math.max(0, top - 12);
          scroller.scrollTo({ y: scrollTo, animated: true });
        }, () => {});
      } catch (e) {
        // ignore
      }
    }, 60);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setContacts(JSON.parse(raw));
        } else {
          // Fallback: load contacts from Firestore for this user
          try {
            const username = (await getData('username')) || null;
            if (username) {
              const q = fsQuery(
                collection(db, 'emergencyData'),
                where('username', '==', username),
                where('dataType', '==', 'contacts')
              );
              const snaps = await getDocs(q);
              if (!snaps.empty) {
                // Map each document's data field into a contact entry
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
                  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fromDb)); } catch (_) {}
                }
              }
            }
          } catch (dbErr) {
            console.warn('contacts: failed to load from firestore', dbErr);
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (next) => {
    try {
      // We'll persist to Firestore and build a finalContacts array with real IDs
      const username = (await getData('username')) || 'unknown';
      const finalContacts = [];

      for (const c of (next || [])) {
        const dataObj = {
          name: c.name || '',
          phone: c.phone || '',
          relation: c.relation || '',
          blank1: '',
          blank2: '',
        };

        if (String(c.id).startsWith('c_')) {
          // New local contact -> create in Firestore and replace local id with remote id
          try {
            const docRef = await addDoc(collection(db, 'emergencyData'), {
              data: dataObj,
              dataType: 'contacts',
              username
            });
            finalContacts.push({ ...c, id: docRef.id });
          } catch (e) {
            console.warn('contacts: failed to add new contact to firestore', e);
            // fallback: keep local id so user data isn't lost
            finalContacts.push(c);
          }
        } else {
          // Existing remote contact -> update the document
          try {
            const remoteRef = doc(db, 'emergencyData', c.id);
            await updateDoc(remoteRef, { data: dataObj });
            finalContacts.push(c);
          } catch (e) {
            console.warn('contacts: failed to update contact in firestore', e);
            // still push current contact to final list
            finalContacts.push(c);
          }
        }
      }

      // persist final contacts array locally and update state
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalContacts));
      } catch (_e) { /* ignore storage errors */ }
      setContacts(finalContacts);
      console.log('contacts: saved (local + firestore sync)');
    } catch (e) {
      console.warn('Failed to save contacts', e);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', phone: '', relation: '' });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name || '', phone: c.phone || '', relation: c.relation || '' });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    Alert.alert('Delete Contact', `Delete ${contact.name || 'this contact'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const next = contacts.filter(c => c.id !== id);
          // delete remote doc if this contact appears to be a Firestore doc
          try {
            if (!String(id).startsWith('c_')) {
              await deleteDoc(doc(db, 'emergencyData', id));
            }
          } catch (e) {
            console.warn('contacts: failed to delete remote doc', e);
          }
          await save(next);
        }
      }
    ]);
  };

  const handleSaveForm = async () => {
    const name = (form.name || '').trim();
    const phone = (form.phone || '').trim();
    const relation = (form.relation || '').trim();
    if (!name || !phone) {
      Alert.alert('Validation', 'Please provide at least a name and phone number.');
      return;
    }
    if (editingId) {
      const next = contacts.map(c => c.id === editingId ? { ...c, name, phone, relation } : c);
      await save(next);
    } else {
      const newContact = { id: `c_${Date.now()}`, name, phone, relation };
      const next = [newContact, ...contacts];
      await save(next);
    }
    setShowForm(false);
  };

  const topPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : (insets.top || 20);

  return (
    <View style={{ flex: 1, backgroundColor: colors.light, paddingTop: topPadding }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} translucent={false} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'← Back'}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.subtitle}>Add people to call or text during an emergency. These are saved to your account.</Text>

          <TouchableOpacity style={styles.addButton} onPress={openAdd}>
            <Text style={styles.addButtonText}>+ Add Contact</Text>
          </TouchableOpacity>

          {loading ? (
            <Text style={{ marginTop: 12, color: colors.muted }}>Loading…</Text>
          ) : contacts.length === 0 ? (
            <Text style={{ marginTop: 12, color: colors.muted }}>No contacts yet. Add one above.</Text>
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              style={{ marginTop: 12 }}
              renderItem={({ item }) => (
                <View style={styles.contactRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactMeta}>{item.relation || 'Contact'} • {item.phone}</Text>
                  </View>
                  <View style={styles.contactActions}>
                    <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconButton}>
                      <Text style={styles.iconText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.iconButton, { marginLeft: 8 }]}>
                      <Text style={[styles.iconText, { color: '#EF4444' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>

      </ScrollView>

      <Modal visible={showForm} animationType="fade" transparent>
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
          <View style={styles.modalBackdrop}>
            {/* modalCard: absolutely positioned; compute height so bottom aligns with keyboard top */}
            <View
              ref={modalCardRef}
              style={[
                styles.modalCard,
                (() => {
                  const topInset = insets?.top || 20;
                  const bottomInset = insets?.bottom || 8;
                  const topOffset = topInset + 12; // small gap from top safe area
                  // height = screenHeight - topOffset - keyboardHeight (keyboardHeight may be 0)
                  let modalHeight = Math.max(220, screenHeight - topOffset - (keyboardHeight || bottomInset) - 12);
                  // When keyboard is not visible (initial open), cap modal height so footer is closer to inputs
                  if (!keyboardHeight) {
                    modalHeight = Math.min(modalHeight, Math.round(screenHeight * 0.60));
                  }
                   return {
                     position: 'absolute',
                     left: 16,
                     right: 16,
                     top: topOffset,
                     height: modalHeight,
                   };
                 })(),
               ]}
             >
              {/* content area scrolls; footer is fixed at bottom of modal to avoid extra empty space */}
              <ScrollView
                ref={modalScrollRef}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 8 }}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.modalTitle}>{editingId ? 'Edit Contact' : 'New Contact'}</Text>
                <Text style={styles.modalLabel}>Name</Text>
                <TextInput
                  ref={nameRef}
                  placeholder="Name"
                  value={form.name}
                  onChangeText={(t) => setForm(f => ({ ...f, name: t }))}
                  style={styles.input}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onFocus={() => scrollInputIntoView(nameRef)}
                  onSubmitEditing={() => { phoneRef.current?.focus?.(); }}
                />
                <Text style={styles.modalLabel}>Phone Number</Text>
                <TextInput
                  ref={phoneRef}
                  placeholder="Phone"
                  value={form.phone}
                  onChangeText={(t) => setForm(f => ({ ...f, phone: t }))}
                  style={styles.input}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onFocus={() => scrollInputIntoView(phoneRef)}
                />
                <Text style={styles.modalLabel}>Relation</Text>
                <TextInput
                  ref={relationRef}
                  placeholder="Relation (optional)"
                  value={form.relation}
                  onChangeText={(t) => setForm(f => ({ ...f, relation: t }))}
                  style={styles.input}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onFocus={() => scrollInputIntoView(relationRef)}
                />
              </ScrollView>

              {/* Footer fixed to bottom of modalCard so no extra empty scroll space appears */}
              <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => { Keyboard.dismiss(); setShowForm(false); }}
                    style={[styles.modalButton, { backgroundColor: '#E5E7EB' }]}
                  >
                    <Text style={{ color: '#111', fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSaveForm} style={[styles.modalButton, { marginLeft: 8, backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
           </View>
         </TouchableWithoutFeedback>
       </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 12, // increased breathing room for the screen heading
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6
  },
  addButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F1FDF6',
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  addButtonText: {
    color: colors.primary,
    fontWeight: '700'
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  contactName: {
    fontWeight: '700',
    color: colors.secondary,
    fontSize: 16
  },
  contactMeta: {
    color: colors.muted,
    marginTop: 4
  },
  contactActions: {
    flexDirection: 'row',
    marginLeft: 12
  },
  iconButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  iconText: {
    color: colors.primary,
    fontWeight: '700'
  },
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: '700'
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginTop: 8,    // added top margin so modal heading sits lower
    marginBottom: 8,
    color: colors.primary
  },
  modalLabel: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: colors.secondary,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    backgroundColor: '#fff'
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10
  }
});
