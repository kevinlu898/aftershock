import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDoc, collection, query as fsQuery, getDocs, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from "react";
import { InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Markdown from "react-native-markdown-display";
// add back WebView import for rendering saved HTML
import { WebView } from 'react-native-webview';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from "../../css";
import { db } from '../../db/firebaseConfig';
import { getData } from '../../storage/storageUtils';

const STORAGE_KEY = "my_plan";

export default function MyPlan({ navigation }) {
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState({
    evacuateRoute: "",
    meetUpPoints: "",
    aftermathProcedures: "",
    other: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({}); // which section is open for editing
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const refs = {
    evacuateRoute: useRef(null),
    meetUpPoints: useRef(null),
    aftermathProcedures: useRef(null),
    other: useRef(null),
  };

  // editor handlers registry so header button can trigger save+close
  const editorsApi = useRef({});
  const [currentFocusedKey, setCurrentFocusedKey] = useState(null);

  const focusNext = (key) => {
    const order = ['evacuateRoute', 'meetUpPoints', 'aftermathProcedures', 'other'];
    const idx = order.indexOf(key);
    if (idx >= 0 && idx < order.length - 1) {
      const nextKey = order[idx + 1];
      refs[nextKey]?.current?.focus?.();
    } else {
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPlan((prev) => ({ ...prev, ...parsed }));
        } else {
          // No local plan found -> try loading the latest plan from Firestore
          try {
            const username = (await getData('username')) || null;
            if (username) {
              const q = fsQuery(
                collection(db, 'emergencyData'),
                where('username', '==', username),
                where('dataType', '==', 'plans')
              );
              const snaps = await getDocs(q);
              if (!snaps.empty && snaps.docs.length > 0) {
                // pick the last document (most recently added in typical usage)
                const docSnap = snaps.docs[snaps.docs.length - 1];
                const remote = docSnap.data()?.data || {};
                const next = {
                  evacuateRoute: remote.evacuationRoute || remote.content || '',
                  meetUpPoints: remote.meetUpPoints || '',
                  aftermathProcedures: remote.aftermathProcedures || '',
                  other: remote.other || '',
                };
                setPlan((prev) => ({ ...prev, ...next }));
                // persist into AsyncStorage for offline use
                try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
              }
            }
          } catch (dbErr) {
            console.warn('myPlan: firestore load failed', dbErr);
          }
        }
      } catch (e) {
        console.warn("Failed to load plan", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const savePlan = async (next) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setPlan(next);

      // Store to database emergencyData collection
      try {
        const username = (await getData('username')) || 'unknown';
        // Storage format: evacuationRoute, meetUpPoints, aftermathProcedures, other, and a blank field
        const dataObj = {
          evacuationRoute: next.evacuateRoute || '',
          meetUpPoints: next.meetUpPoints || '',
          aftermathProcedures: next.aftermathProcedures || '',
          other: next.other || '',
          blank: ''
        };

        await addDoc(collection(db, 'emergencyData'), {
          data: dataObj,
          dataType: 'plans',
          username
        });
        console.log('myPlan: saved to firestore');
      } catch (e) {
        console.warn('myPlan: firestore save failed', e);
      }

    } catch (e) {
      console.warn("Failed to save plan", e);
    }
  };

  const toggleEdit = (key) => {
    // if currently editing, ask the section editor to save and close
    if (editing[key]) {
      const api = editorsApi.current[key];
      if (api && typeof api.saveAndClose === 'function') {
        api.saveAndClose();
        return;
      }
    }
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
    // focus after a short delay when opening
    setTimeout(() => refs[key]?.current?.focus?.(), 250);
  };

  const applyWrap = (key, left, right = left) => {
    const text = plan[key] || "";
    const { start, end } = selection;
    // bounds
    const s = Math.max(0, start || 0);
    const e = Math.max(0, end || s);
    const before = text.slice(0, s);
    const selected = text.slice(s, e);
    const after = text.slice(e);
    const updated = before + left + selected + right + after;
    const next = { ...plan, [key]: updated };
    savePlan(next);
    // update selection to be inside the markers
    const newPos = e + left.length + right.length;
    setTimeout(() => {
      refs[key]?.current?.setNativeProps({ text: updated });
      refs[key]?.current?.focus?.();
      refs[key]?.current?.setSelection && refs[key]?.current?.setSelection({ start: newPos, end: newPos });
    }, 50);
  };

  const applyLinePrefix = (key, prefix) => {
    const text = plan[key] || "";
    // add prefix to current line based on selection
    const { start } = selection;
    const pos = Math.max(0, start || 0);
    const before = text.slice(0, pos);
    const after = text.slice(pos);
    // find line start
    const lastNL = before.lastIndexOf("\n");
    const lineStart = lastNL + 1;
    const updated = text.slice(0, lineStart) + prefix + text.slice(lineStart);
    const next = { ...plan, [key]: updated };
    savePlan(next);
    setTimeout(() => {
      refs[key]?.current?.focus?.();
    }, 50);
  };

  const onChangeText = (key, val) => {
    const next = { ...plan, [key]: val };
    setPlan(next);
  };

  const onBlurSave = async () => {
    await savePlan(plan);
  };

  const topPadding = Platform.OS === "android" ? (StatusBar.currentHeight || 0) : (insets.top || 20);

  const Section = ({ title, keyName }) => (
    <View style={styles.sectionCard}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => toggleEdit(keyName)} style={styles.smallButton} accessibilityLabel={editing[keyName] ? 'Close editor' : 'Edit section'}>
          <MaterialCommunityIcons name={editing[keyName] ? 'content-save' : 'pencil'} size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {editing[keyName] ? (
        <SectionEditor title={title} keyName={keyName} />
      ) : (
        <View>
          <View style={styles.previewBox}>
            {/* if the stored content contains HTML, render it so the user sees the formatted result;
                otherwise render via Markdown (plain text / markdown) */}
            {typeof plan[keyName] === 'string' && /<[^>]+>/.test(plan[keyName]) ? (
              <View style={{ height: 140, overflow: 'hidden' }}>
                <WebView
                  originWhitelist={["*"]}
                  source={{
                    html: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial; color:#111; padding:8px; margin:0;} img{max-width:100%;height:auto;} p{line-height:1.45;}</style></head><body>${plan[keyName] || ''}</body></html>`
                  }}
                />
              </View>
            ) : (
              <Markdown style={markdownStyles}>{plan[keyName] || "_No content_"}</Markdown>
            )}
          </View>
          {plan._meta?.[keyName] ? (
            <Text style={styles.metaText}>Last edited: {formatEdited(plan._meta[keyName])}</Text>
          ) : null}
        </View>
      )}
    </View>
  );

  // SectionEditor component uses local state to avoid re-rendering parent on each keystroke
 const SectionEditor = ({ title, keyName }) => {
  const [localText, setLocalText] = useState(plan[keyName] || "");
  const ref = refs[keyName];
  const richRef = useRef(null);

  useEffect(() => {
    setLocalText(plan[keyName] || "");
  }, [editing[keyName]]);

  useEffect(() => {
    editorsApi.current[keyName] = {
      saveAndClose: async () => {
        try { await richRef.current?.blur(); } catch (e) {}
        await saveAndSync();
        setEditing(prev => ({ ...prev, [keyName]: false }));
      }
    };
    return () => { delete editorsApi.current[keyName]; };
  }, [localText]);

  const saveAndSync = async () => {
    const next = { ...plan, [keyName]: localText };
    const meta = { ...(plan._meta || {}) };
    meta[keyName] = new Date().toISOString();
    next._meta = meta;
    await savePlan(next);
  };

  const wrap = (left, right = left) => {
    const text = localText || "";
    const s = Math.max(0, sel.start || 0);
    const e = Math.max(0, sel.end || s);
    const before = text.slice(0, s);
    const selected = text.slice(s, e);
    const after = text.slice(e);
    const updated = before + left + selected + right + after;
    setLocalText(updated);
    setTimeout(() => ref?.current?.focus?.(), 50);
  };

  const linePrefix = (prefix) => {
    const text = localText || "";
    const pos = Math.max(0, sel.start || 0);
    const lastNL = text.slice(0, pos).lastIndexOf("\n");
    const lineStart = lastNL + 1;
    const updated = text.slice(0, lineStart) + prefix + text.slice(lineStart);
    setLocalText(updated);
    setTimeout(() => ref?.current?.focus?.(), 50);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
      >
        <View>
          <RichToolbar
            editor={richRef}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.heading1,
              actions.insertLink
            ]}
            style={{ backgroundColor: 'transparent', marginBottom: 8, alignSelf: 'stretch' }}
          />

          <RichEditor
            ref={richRef}
            initialContentHTML={localText}
            style={[styles.editor, { minHeight: 160 }]}
            editorStyle={{ backgroundColor: '#fff', color: '#111' }}
            placeholder={`Write your ${title.toLowerCase()}...`}
            onChange={(html) => setLocalText(html)}
            onBlur={async () => { await saveAndSync(); setCurrentFocusedKey(null); }}
            onFocus={() => setCurrentFocusedKey(keyName)}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};


  // helper to format last edited
  const formatEdited = (iso) => {
    try { if (!iso) return null; const d = new Date(iso); return d.toLocaleString(); } catch (e) { return null; }
  };

  // overall last saved (latest per-section timestamp)
  const getLastSaved = () => {
    try {
      const meta = plan._meta || {};
      const times = Object.values(meta).filter(Boolean);
      if (times.length === 0) return null;
      const latest = times.map(t => new Date(t)).sort((a,b) => b - a)[0];
      return latest.toLocaleString();
    } catch (e) { return null; }
  };

  const [showFull, setShowFull] = useState(false);

  const FullModal = () => {
    const lastSaved = getLastSaved();

    // Build a markdown version of the combined plan instead of HTML for WebView
    const markdownCombined = `# My Emergency Plan

${plan.evacuateRoute || ''}

## Meet-up Points

${plan.meetUpPoints || ''}

## Aftermath Procedures

${plan.aftermathProcedures || ''}

## Other

${plan.other || ''}
`;

    return (
      <Modal visible={showFull} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.light, paddingTop: topPadding }}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.light} translucent={false} />
          <View style={{ flex: 1, padding: 18 }}>
            <Text style={styles.title}>Full Emergency Plan</Text>
            {lastSaved ? <Text style={styles.metaText}>Last saved: {lastSaved}</Text> : null}
            <View style={{ flex: 1, marginTop: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff', padding: 12 }}>
              <ScrollView contentContainerStyle={{ padding: 8 }}>
                <Markdown style={markdownStyles}>{markdownCombined}</Markdown>
              </ScrollView>
            </View>

            <TouchableOpacity onPress={() => setShowFull(false)} style={[styles.saveButton, { marginTop: 18 }]}>
              <Text style={styles.saveButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.light, paddingTop: topPadding }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} translucent={false} />
      <ScrollView contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"← Back"}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Emergency Plan</Text>
        <Text style={styles.subtitle}>Create and save a plan for emergency situations. Use the editor to format text (Markdown supported).</Text>
        <TouchableOpacity onPress={() => setShowFull(true)} style={[styles.smallButton, { backgroundColor: '#fff', marginTop: 8, marginBottom: 10, alignSelf: 'flex-start' }]}>
          <Text style={styles.smallButtonText}>View Full Plan</Text>
        </TouchableOpacity>

        <Section title="Evacuation Route" keyName="evacuateRoute" />
        <Section title="Meet-up Points" keyName="meetUpPoints" />
        <Section title="Aftermath Procedures" keyName="aftermathProcedures" />
        <Section title="Other" keyName="other" />

        {showFull && <FullModal />}
      </ScrollView>
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={'planAccessory'}>
          <View style={styles.accessory}>
            <TouchableOpacity onPress={async () => {
                const k = currentFocusedKey;
                if (k && editorsApi.current[k] && typeof editorsApi.current[k].saveAndClose === 'function') {
                  await editorsApi.current[k].saveAndClose();
                  setCurrentFocusedKey(null);
                } else {
                  Keyboard.dismiss();
                }
              }} style={styles.accessoryButton}>
              <Text style={styles.accessoryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: colors.primary, marginBottom: 6 },
  subtitle: { color: colors.muted, marginBottom: 12 },
  backButton: { marginBottom: 12, alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#fff" },
  backButtonText: { color: colors.primary, fontWeight: "700" },
  // ensure card clips children (so editor toolbar / webview do not hang outside rounded corners)
  sectionCard: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
  sectionTitle: { fontWeight: "800", fontSize: 16, color: colors.secondary },
  toolbar: { flexDirection: "row", flexWrap: 'wrap', marginTop: 12, marginBottom: 8, alignItems: 'center' },
  toolButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#F8FAF8", borderRadius: 8, marginRight: 8, marginBottom: 8 },
  smallButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  smallButtonText: { color: colors.primary, fontWeight: "700" },
  editor: { minHeight: 120, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 10, backgroundColor: "#fff" },
  previewLabel: { marginTop: 10, marginBottom: 6, color: colors.muted, fontWeight: "700" },
  // clip preview content and remove extra padding that could push children outside
  previewBox: { backgroundColor: "#F8FAFC", borderRadius: 8, padding: 8, minHeight: 60, overflow: 'hidden' },
  saveButton: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "800" },
  accessory: { backgroundColor: "#fff", padding: 10, borderTopWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", justifyContent: "flex-end" },
  accessoryButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.primary },
  accessoryText: { color: "#fff", fontWeight: "700" },
  metaText: { fontSize: 12, color: colors.muted, marginTop: 4 },
});

const markdownStyles = {
  body: { color: "#111", fontSize: 14 },
  heading3: { fontSize: 16, fontWeight: "800" },
};
