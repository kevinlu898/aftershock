import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from "../../css";

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
    } catch (e) {
      console.warn("Failed to save plan", e);
    }
  };

  const toggleEdit = (key) => {
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
    // focus after a short delay
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
        <TouchableOpacity onPress={() => toggleEdit(keyName)} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>{editing[keyName] ? "Close" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      {editing[keyName] ? (
        <SectionEditor title={title} keyName={keyName} />
      ) : (
        <View>
          <View style={styles.previewBox}>
            <Markdown style={markdownStyles}>{plan[keyName] || "_No content_"}</Markdown>
          </View>
        </View>
      )}
    </View>
  );

  // SectionEditor component uses local state to avoid re-rendering parent on each keystroke
  const SectionEditor = ({ title, keyName }) => {
    const [localText, setLocalText] = useState(plan[keyName] || "");
    const [sel, setSel] = useState({ start: 0, end: 0 });
    const ref = refs[keyName];

    useEffect(() => {
      setLocalText(plan[keyName] || "");
    }, [editing[keyName]]); // reset when toggling editor

    const saveAndSync = async () => {
      const next = { ...plan, [keyName]: localText };
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}>
          <View>
            <View style={styles.toolbar}>
              <TouchableOpacity onPress={() => wrap('**')} style={styles.toolButton}><MaterialCommunityIcons name="format-bold" size={16} color={colors.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => wrap('*')} style={styles.toolButton}><MaterialCommunityIcons name="format-italic" size={16} color={colors.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => linePrefix('### ')} style={styles.toolButton}><MaterialCommunityIcons name="format-header-3" size={16} color={colors.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => linePrefix('- ')} style={styles.toolButton}><MaterialCommunityIcons name="format-list-bulleted" size={16} color={colors.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => linePrefix('1. ')} style={styles.toolButton}><MaterialCommunityIcons name="format-list-numbered" size={16} color={colors.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => wrap('<u>', '</u>')} style={styles.toolButton}><MaterialCommunityIcons name="format-underline" size={16} color={colors.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => linePrefix('> ')} style={styles.toolButton}><MaterialCommunityIcons name="format-quote-close" size={16} color={colors.primary} /></TouchableOpacity>
            </View>

            <TextInput
              ref={ref}
              multiline
              style={styles.editor}
              value={localText}
              onChangeText={(t) => setLocalText(t)}
              onSelectionChange={({ nativeEvent: { selection } }) => setSel(selection)}
              onBlur={async () => { await saveAndSync(); }}
              placeholder={`Write your ${title.toLowerCase()}...`}
              textAlignVertical="top"
              blurOnSubmit={false}
              returnKeyType="next"
              onSubmitEditing={() => focusNext(keyName)}
            />

            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewBox}>
              <Markdown style={markdownStyles}>{localText || "_No content_"}</Markdown>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  };

  const [showFull, setShowFull] = useState(false);

  const FullModal = () => (
    <Modal visible={showFull} animationType="slide">
      <View style={{ flex: 1, backgroundColor: colors.light, paddingTop: topPadding }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.light} translucent={false} />
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <Text style={styles.title}>Full Emergency Plan</Text>
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "800", marginBottom: 6 }}>Evacuation Route</Text>
            <Markdown style={markdownStyles}>{plan.evacuateRoute || "_No content_"}</Markdown>

            <Text style={{ fontWeight: "800", marginTop: 12, marginBottom: 6 }}>Meet-up Points</Text>
            <Markdown style={markdownStyles}>{plan.meetUpPoints || "_No content_"}</Markdown>

            <Text style={{ fontWeight: "800", marginTop: 12, marginBottom: 6 }}>Aftermath Procedures</Text>
            <Markdown style={markdownStyles}>{plan.aftermathProcedures || "_No content_"}</Markdown>

            <Text style={{ fontWeight: "800", marginTop: 12, marginBottom: 6 }}>Other</Text>
            <Markdown style={markdownStyles}>{plan.other || "_No content_"}</Markdown>
          </View>

          <TouchableOpacity onPress={() => setShowFull(false)} style={[styles.saveButton, { marginTop: 18 }]}>
            <Text style={styles.saveButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

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

        <TouchableOpacity onPress={() => savePlan(plan)} style={[styles.saveButton, { marginTop: 18 }]}>
          <Text style={styles.saveButtonText}>Save Plan</Text>
        </TouchableOpacity>

        {showFull && <FullModal />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: colors.primary, marginBottom: 6 },
  subtitle: { color: colors.muted, marginBottom: 12 },
  backButton: { marginBottom: 12, alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#fff" },
  backButtonText: { color: colors.primary, fontWeight: "700" },
  sectionCard: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontWeight: "800", fontSize: 16, color: colors.secondary },
  toolbar: { flexDirection: "row", flexWrap: 'wrap', marginTop: 12, marginBottom: 8, alignItems: 'center' },
  toolButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#F8FAF8", borderRadius: 8, marginRight: 8, marginBottom: 8 },
  smallButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  smallButtonText: { color: colors.primary, fontWeight: "700" },
  editor: { minHeight: 120, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 10, backgroundColor: "#fff" },
  previewLabel: { marginTop: 10, marginBottom: 6, color: colors.muted, fontWeight: "700" },
  previewBox: { backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, minHeight: 60 },
  saveButton: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "800" },
});

const markdownStyles = {
  body: { color: "#111", fontSize: 14 },
  heading3: { fontSize: 16, fontWeight: "800" },
};
