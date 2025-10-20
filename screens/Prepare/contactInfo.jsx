import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../css";

const STORAGE_KEY = 'emergency_contacts';

export default function EmergencyContacts({ navigation }) {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', relation: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setContacts(JSON.parse(raw));
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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setContacts(next);
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

      <Modal visible={showForm} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{editingId ? 'Edit Contact' : 'New Contact'}</Text>
                <Text style={styles.modalLabel}>Name</Text>
                <TextInput placeholder="Name" value={form.name} onChangeText={(t) => setForm(f => ({ ...f, name: t }))} style={styles.input} returnKeyType="next" />
                <Text style={styles.modalLabel}>Phone Number</Text>
                <TextInput placeholder="Phone" value={form.phone} onChangeText={(t) => setForm(f => ({ ...f, phone: t }))} style={styles.input} keyboardType="phone-pad" returnKeyType="done" blurOnSubmit={true} onSubmitEditing={() => Keyboard.dismiss()} />
                <Text style={styles.modalLabel} >Relation</Text>
                <TextInput placeholder="Relation (optional)" value={form.relation} onChangeText={(t) => setForm(f => ({ ...f, relation: t }))} style={styles.input} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                  <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowForm(false); }} style={[styles.modalButton, { backgroundColor: '#E5E7EB' }]}>
                    <Text style={{ color: '#111', fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSaveForm} style={[styles.modalButton, { marginLeft: 8, backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
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
    color: colors.primary
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
    borderTopRightRadius: 12
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 18,
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
