import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addDoc,
  collection,
  query as fsQuery,
  getDocs,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { WebView } from "react-native-webview";
import { colors } from "../../css";
import { db } from "../../db/firebaseConfig";
import { aiResponse as getAiResponse } from "../../requests";
import { getData } from "../../storage/storageUtils";

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
  const [editing, setEditing] = useState({});

  const editorsApi = useRef({});
  const [currentFocusedKey, setCurrentFocusedKey] = useState(null);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPlan((prev) => ({ ...prev, ...parsed }));
        } else {
          try {
            const username = (await getData("username")) || null;
            if (username) {
              const q = fsQuery(
                collection(db, "emergencyData"),
                where("username", "==", username),
                where("dataType", "==", "plans")
              );
              const snaps = await getDocs(q);
              if (!snaps.empty && snaps.docs.length > 0) {
                const docSnap = snaps.docs[snaps.docs.length - 1];
                const remote = docSnap.data()?.data || {};
                const next = {
                  evacuateRoute: remote.evacuationRoute || remote.content || "",
                  meetUpPoints: remote.meetUpPoints || "",
                  aftermathProcedures: remote.aftermathProcedures || "",
                  other: remote.other || "",
                };
                setPlan((prev) => ({ ...prev, ...next }));
                try {
                  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch (_) {}
              }
            }
          } catch (dbErr) {
            console.warn("myPlan: firestore load failed", dbErr);
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

  // Store data
  const savePlan = async (next) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setPlan(next);
      try {
        const username = (await getData("username")) || "unknown";
        const dataObj = {
          evacuationRoute: next.evacuateRoute || "",
          meetUpPoints: next.meetUpPoints || "",
          aftermathProcedures: next.aftermathProcedures || "",
          other: next.other || "",
          blank: "",
        };

        await addDoc(collection(db, "emergencyData"), {
          data: dataObj,
          dataType: "plans",
          username,
        });
        console.log("myPlan: saved to firestore");
      } catch (e) {
        console.warn("myPlan: firestore save failed", e);
      }
    } catch (e) {
      console.warn("Failed to save plan", e);
    }
  };

  const toggleEdit = (key) => {
    if (editing[key]) {
      const api = editorsApi.current[key];
      if (api && typeof api.saveAndClose === "function") {
        api.saveAndClose();
        return;
      }
    }
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
    // no automatic focus here — editor components manage focus when opened
  };

  const topPadding =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top || 20;

  const Section = ({ title, keyName }) => (
    <View style={styles.sectionCard}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => toggleEdit(keyName)}
            style={styles.smallButton}
            accessibilityLabel={
              editing[keyName] ? "Close editor" : "Edit section"
            }
          >
            <MaterialCommunityIcons
              name={editing[keyName] ? "content-save" : "pencil"}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openAiModal(title, keyName)}
            style={[styles.smallButton, { marginLeft: 8 }]}
            accessibilityLabel={`Ask AI about ${title}`}
          >
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {editing[keyName] ? (
        <SectionEditor title={title} keyName={keyName} />
      ) : (
        <View style={styles.previewWrapper}>
          {typeof plan[keyName] === "string" &&
          /<[^>]+>/.test(plan[keyName]) ? (
            <View style={styles.webviewPreview}>
              <WebView
                originWhitelist={["*"]}
                source={{
                  html: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial; color:#111; padding:8px; margin:0;} img{max-width:100%;height:auto;} p{line-height:1.45;}</style></head><body>${
                    plan[keyName] || ""
                  }</body></html>`,
                }}
                style={{ flex: 1 }}
                scalesPageToFit
              />
            </View>
          ) : (
            <View style={styles.Wrap}>
              <Markdown style={markdownStyles}>
                {decodeAiMarkdown(plan[keyName] || "_No content_")}
              </Markdown>
            </View>
          )}
          {plan._meta?.[keyName] ? (
            <Text style={styles.metaText}>
              Last edited: {formatEdited(plan._meta[keyName])}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );

  // Text editor for each section
  const SectionEditor = ({ title, keyName }) => {
    const [localText, setLocalText] = useState(plan[keyName] || "");
    const richRef = useRef(null);

    useEffect(() => {
      setLocalText(plan[keyName] || "");
    }, [editing[keyName]]);

    useEffect(() => {
      editorsApi.current[keyName] = {
        saveAndClose: async () => {
          try {
            await richRef.current?.blur();
          } catch (e) {}
          await saveAndSync();
          setEditing((prev) => ({ ...prev, [keyName]: false }));
        },
      };
      return () => {
        delete editorsApi.current[keyName];
      };
    }, [localText]);

    const saveAndSync = async () => {
      const next = { ...plan, [keyName]: localText };
      const meta = { ...(plan._meta || {}) };
      meta[keyName] = new Date().toISOString();
      next._meta = meta;
      await savePlan(next);
    };

    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "position"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
        >
          <View style={styles.editorContainer}>
            <RichToolbar
              editor={richRef}
              actions={[
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.insertBulletsList,
                actions.insertOrderedList,
                actions.heading1,
                actions.insertLink,
              ]}
              style={styles.toolbarInline}
            />

            <View style={styles.editorInnerWrapper}>
              <RichEditor
                ref={richRef}
                initialContentHTML={localText}
                style={styles.editorInner}
                editorStyle={{ backgroundColor: "#fff", color: "#111" }}
                placeholder={`Write your ${title.toLowerCase()}...`}
                onChange={(html) => setLocalText(html)}
                onBlur={async () => {
                  await saveAndSync();
                  setCurrentFocusedKey(null);
                }}
                onFocus={() => setCurrentFocusedKey(keyName)}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  };

  const formatEdited = (iso) => {
    try {
      if (!iso) return null;
      const d = new Date(iso);
      return d.toLocaleString();
    } catch (e) {
      return null;
    }
  };
  const getLastSaved = () => {
    try {
      const meta = plan._meta || {};
      const times = Object.values(meta).filter(Boolean);
      if (times.length === 0) return null;
      const latest = times.map((t) => new Date(t)).sort((a, b) => b - a)[0];
      return latest.toLocaleString();
    } catch (e) {
      return null;
    }
  };

  const [showFull, setShowFull] = useState(false);

  // AI modal state
  const [aiVisible, setAiVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTarget, setAiTarget] = useState(null); // null = full plan, or keyName for section

  const openAiModal = (title, keyName = null) => {
    const defaultPrompt = keyName
      ? `Please evaluate and suggest improvements for the following section titled "${title}". Be concise and propose actionable items.`
      : `Please evaluate my full emergency plan and suggest improvements (clarity, missing items, prioritization).`;
    setAiPrompt(defaultPrompt);
    setAiTarget(keyName);
    setAiResponse(null);
    setAiVisible(true);
  };

  const submitAi = async () => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      // Prepare payload: include either specific section content or full plan
      const payload = {
        prompt: aiPrompt,
        plan: {
          evacuateRoute: plan.evacuateRoute,
          meetUpPoints: plan.meetUpPoints,
          aftermathProcedures: plan.aftermathProcedures,
          other: plan.other,
        },
        target: aiTarget, // null or keyName
      };

      // include the plan text inside the prompt for clearer context
      const fullPrompt = `${aiPrompt}\n\nCurrent plan content:\nEvacuation Route:\n${
        payload.plan.evacuateRoute || "(none)"
      }\n\nMeet-up Points:\n${
        payload.plan.meetUpPoints || "(none)"
      }\n\nAftermath Procedures:\n${
        payload.plan.aftermathProcedures || "(none)"
      }\n\nOther:\n${payload.plan.other || "(none)"}\n`;

      // Use the lightweight aiResponse helper which returns a text answer.
      const json = await getAiResponse(fullPrompt);

      // Log raw payload for debugging (trimmed to avoid huge logs)
      try {
        console.log(
          "submitAi: raw ai helper response:",
          JSON.stringify(json).slice(0, 1000)
        );
      } catch (_) {}

      const result =
        json?.result ||
        json?.output ||
        json?.text ||
        (typeof json === "string" ? json : null);
      try {
        console.log(
          "submitAi: extracted result:",
          (result || "").slice?.(0, 1000) || result
        );
      } catch (_) {}
      if (!result) {
        // If server returned unexpected shape, show debug info
        const debug = JSON.stringify(json).slice(0, 200);
        console.warn(
          "submitAi: unexpected response shape from Gemini helper",
          debug
        );
        setAiResponse(`AI returned unexpected format: ${debug}`);
      } else {
        setAiResponse(result);
      }
    } catch (e) {
      // Show error details so you can see why the request failed
      console.warn("submitAi: sendGemini error", e);
      setAiResponse(`AI request failed: ${e?.message || e}`);
      // also keep fallback heuristic appended so user still gets guidance
      const content = aiTarget
        ? plan[aiTarget] || ""
        : `${plan.evacuateRoute || ""} ${plan.meetUpPoints || ""} ${
            plan.aftermathProcedures || ""
          } ${plan.other || ""}`;
      if (!content || content.trim().length < 50) {
        setAiResponse(
          (prev) =>
            (prev ? prev + "\n\n" : "") +
            "Fallback: The content is sparse. Consider adding specific steps, exact meet-up coordinates, contact details, and responsibilities for each family member."
        );
      } else {
        setAiResponse(
          (prev) =>
            (prev ? prev + "\n\n" : "") +
            "Fallback: High-level review: consider adding explicit actions, estimated timings, responsible persons, and alternative routes. Verify utility shutoff steps and special-needs provisions."
        );
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Helper: decode common HTML entities and undo backslash-escaping so
  // markdown renderers receive clean markdown text. Some AI responses may
  // return escaped characters (e.g. `\*\*bold\*\*` or HTML entities)
  // which prevents proper rendering.
  const decodeAiMarkdown = (text) => {
    if (!text || typeof text !== "string") return "";
    let txt = text.trim();

    // If the response is wrapped in triple-backticks (code fence), unwrap it
    // Remove leading ```lang or ``` and trailing ```
    const fenceMatch = txt.match(/^```(?:[\w-]+)?\n([\s\S]*?)\n```$/);
    if (fenceMatch) txt = fenceMatch[1];

    // If wrapped in single backticks, unwrap
    const singleBacktick = txt.match(/^`([\s\S]*?)`$/);
    if (singleBacktick) txt = singleBacktick[1];

    // Decode common HTML entities
    txt = txt
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Some AI responses encode backslashes as HTML entities or unicode escapes
    // e.g. &#92; or \u005c ; convert those to literal backslashes first
    txt = txt.replace(/&#92;/g, "\\").replace(/\\u005c/g, "\\");

    // Collapse long runs of backslashes to a single backslash to normalize
    txt = txt.replace(/\\{2,}/g, "\\");

    // If the AI returned HTML (e.g. <p>...</p>), strip tags but keep inner text
    if (/</.test(txt) && />/.test(txt)) {
      // quick HTML tag stripper (keeps inner text)
      txt = txt.replace(/<\/?[^>]+(>|$)/g, "");
    }

    // Remove unnecessary backslash-escaping before markdown punctuation so
    // `\*\*bold\*\*` becomes `**bold**`.
    txt = txt.replace(/\\([\\`*_{}\[\]()#+\-.!~>])/g, "$1");

    // Also remove any remaining single backslashes immediately before
    // markdown characters (extra safety)
    txt = txt.replace(/\\([*_`~\[\]()#+\-.!>])/g, "$1");

    // Trim again and return
    return txt.trim();
  };

  const applyAiSuggestion = async () => {
    if (!aiResponse) return;
    const next = { ...plan };
    if (aiTarget && typeof aiTarget === "string") {
      next[aiTarget] = (next[aiTarget] || "") + "\n\n" + aiResponse;
      const meta = { ...(next._meta || {}) };
      meta[aiTarget] = new Date().toISOString();
      next._meta = meta;
      await savePlan(next);
    } else {
      // Append to 'other' for full plan suggestions
      next.other = (next.other || "") + "\n\n" + aiResponse;
      const meta = { ...(next._meta || {}) };
      meta.other = new Date().toISOString();
      next._meta = meta;
      await savePlan(next);
    }
    setAiVisible(false);
  };

  const FullModal = () => {
    const lastSaved = getLastSaved();
    const combinedRaw = `${plan.evacuateRoute || ""}${plan.meetUpPoints || ""}${
      plan.aftermathProcedures || ""
    }${plan.other || ""}`;
    const hasHtml = /<[^>]+>/.test(combinedRaw);

    const markdownCombined = `# Evacuation Route

${plan.evacuateRoute || ""}

## Meet-up Points

${plan.meetUpPoints || ""}

## Aftermath Procedures

${plan.aftermathProcedures || ""}

## Other

${plan.other || ""}
`;

    const wrapHtml = (content) => {
      const safe = content || "<p><em>No content</em></p>";
      return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial; color:#111; padding:12px; background:transparent;} img{max-width:100%;height:auto;} p{line-height:1.5;}</style></head><body>${safe}</body></html>`;
    };

    return (
      <Modal visible={showFull} animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: colors.light,
            paddingTop: topPadding,
          }}
        >
          <StatusBar
            barStyle="dark-content"
            backgroundColor={colors.light}
            translucent={false}
          />
          <View style={{ flex: 1, padding: 18 }}>
            <Text style={styles.title}>Full Emergency Plan</Text>
            {lastSaved ? (
              <Text style={styles.metaText}>Last saved: {lastSaved}</Text>
            ) : null}
            <View
              style={{
                flex: 1,
                marginTop: 12,
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: "#fff",
                padding: 12,
              }}
            >
              {hasHtml ? (
                <WebView
                  originWhitelist={["*"]}
                  source={{
                    html: wrapHtml(`
                  <h2>My Emergency Plan</h2>
                  ${plan.evacuateRoute || ""}
                  <hr/>
                  <h2>Meet-up Points</h2>
                  ${plan.meetUpPoints || ""}
                  <hr/>
                  <h2>Aftermath Procedures</h2>
                  ${plan.aftermathProcedures || ""}
                  <hr/>
                  <h2>Other</h2>
                  ${plan.other || ""}
                `),
                  }}
                  style={{ flex: 1 }}
                />
              ) : (
                <ScrollView contentContainerStyle={{ padding: 8 }}>
                  <Markdown style={markdownStyles}>{markdownCombined}</Markdown>
                </ScrollView>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowFull(false)}
              style={[styles.saveButton, { marginTop: 18 }]}
            >
              <Text style={styles.saveButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.light, paddingTop: topPadding }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.light}
        translucent={false}
      />
      <ScrollView
        contentContainerStyle={{ padding: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{"← Back"}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Emergency Plan</Text>
        <Text style={styles.subtitle}>
          Create and save a plan for emergency situations. Use the editor to
          format text (Markdown supported).
        </Text>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => setShowFull(true)}
            style={[
              styles.smallButton,
              {
                backgroundColor: "#fff",
                marginTop: 8,
                marginBottom: 10,
                alignSelf: "flex-start",
              },
            ]}
          >
            <Text style={styles.smallButtonText}>View Full Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openAiModal("Full Plan", null)}
            style={[
              styles.smallButton,
              {
                backgroundColor: "#fff",
                marginTop: 8,
                marginBottom: 10,
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
            accessibilityLabel="Ask AI to review full plan"
          >
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.smallButtonText, { marginLeft: 6 }]}>
              Ask AI
            </Text>
          </TouchableOpacity>
        </View>

        <Section title="Evacuation Route" keyName="evacuateRoute" />
        <Section title="Meet-up Points" keyName="meetUpPoints" />
        <Section title="Aftermath Procedures" keyName="aftermathProcedures" />
        <Section title="Other" keyName="other" />

        {showFull && <FullModal />}
      </ScrollView>
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={"planAccessory"}>
          <View style={styles.accessory}>
            <TouchableOpacity
              onPress={async () => {
                const k = currentFocusedKey;
                if (
                  k &&
                  editorsApi.current[k] &&
                  typeof editorsApi.current[k].saveAndClose === "function"
                ) {
                  await editorsApi.current[k].saveAndClose();
                  setCurrentFocusedKey(null);
                } else {
                  Keyboard.dismiss();
                }
              }}
              style={styles.accessoryButton}
            >
              <Text style={styles.accessoryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      {/* AI Modal */}
      <Modal
        visible={aiVisible}
        animationType="slide"
        onRequestClose={() => setAiVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.light,
            paddingTop: topPadding,
          }}
        >
          <StatusBar
            barStyle="dark-content"
            backgroundColor={colors.light}
            translucent={false}
          />
          <View style={{ flex: 1, padding: 18 }}>
            <Text style={styles.title}>AI Review</Text>
            <Text style={styles.subtitle}>
              Ask the AI to evaluate or improve your plan. Edit the prompt or
              submit as-is.
            </Text>
            <TextInput
              value={aiPrompt}
              onChangeText={setAiPrompt}
              style={styles.aiInput}
              multiline
              placeholder="Enter instructions for the AI..."
            />

            <View style={{ flex: 1, marginTop: 12 }}>
              {aiLoading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : aiResponse ? (
                <ScrollView contentContainerStyle={{ padding: 8 }}>
                  <Markdown style={markdownStyles}>
                    {decodeAiMarkdown(aiResponse)}
                  </Markdown>
                </ScrollView>
              ) : (
                <Text style={styles.metaText}>
                  No response yet. Press Ask AI to send your prompt.
                </Text>
              )}
            </View>

            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <TouchableOpacity
                onPress={submitAi}
                style={[
                  styles.saveButton,
                  { flex: 1, marginRight: 8, backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.saveButtonText}>
                  {aiLoading ? "Asking..." : "Ask AI"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyAiSuggestion}
                style={[styles.smallButton, { flex: 1, alignItems: "center" }]}
              >
                <Text style={styles.smallButtonText}>Apply Suggestion</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setAiVisible(false)}
              style={[
                styles.smallButton,
                { marginTop: 12, alignSelf: "flex-end" },
              ]}
            >
              <Text style={styles.smallButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 6,
  },
  subtitle: { color: colors.muted, marginBottom: 12 },

  backButton: {
    marginBottom: 12,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  backButtonText: { color: colors.primary, fontWeight: "700" },

  sectionCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: { fontWeight: "800", fontSize: 16, color: colors.secondary },

  smallButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallButtonText: { color: colors.primary, fontWeight: "700" },

  previewWrapper: { paddingTop: 8 },
  webviewPreview: {
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  markdownWrap: { minHeight: 80, padding: 6 },

  editorContainer: {
    marginTop: 8,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  toolbarInline: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  editorInnerWrapper: { minHeight: 140, overflow: "hidden" },
  editorInner: { minHeight: 140, padding: 10, backgroundColor: "#fff" },

  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "800" },

  accessory: {
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  accessoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  accessoryText: { color: "#fff", fontWeight: "700" },

  metaText: { fontSize: 12, color: colors.muted, marginTop: 4 },

  aiInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  aiResponseText: { color: "#111", fontSize: 15, lineHeight: 22 },
});

const markdownStyles = {
  body: { color: "#111", fontSize: 14 },
  heading3: { fontSize: 16, fontWeight: "800" },
};
