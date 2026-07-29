import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { addDoc, collection, query as fsQuery, getDocs, where } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, InputAccessoryView, Keyboard, Modal, Platform, ScrollView, StatusBar, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { db } from "../../lib/firebaseConfig";
import { aiResponse as getAiResponse } from "../../lib/api";
import { getData } from "../../lib/storage/storageUtils";
import { useTheme } from "../../lib/theme";
import PlanSectionEditor from "../../components/prepare/PlanSectionEditor";
const STORAGE_KEY = "my_plan";
export default function MyPlan({
  navigation
}) {
  const insets = useSafeAreaInsets();
  const {
    palette
  } = useTheme();
  const markdownStyles = {
    body: {
      color: palette.foreground,
      fontSize: 14
    },
    heading3: {
      color: palette.foreground,
      fontSize: 16,
      fontWeight: "800"
    }
  };
  const [plan, setPlan] = useState({
    evacuateRoute: "",
    meetUpPoints: "",
    aftermathProcedures: "",
    other: ""
  });
  const [, setLoading] = useState(true);
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
          setPlan(prev => ({
            ...prev,
            ...parsed
          }));
        } else {
          try {
            const username = (await getData("username")) || null;
            if (username) {
              const q = fsQuery(collection(db, "emergencyData"), where("username", "==", username), where("dataType", "==", "plans"));
              const snaps = await getDocs(q);
              if (!snaps.empty && snaps.docs.length > 0) {
                const docSnap = snaps.docs[snaps.docs.length - 1];
                const remote = docSnap.data()?.data || {};
                const next = {
                  evacuateRoute: remote.evacuationRoute || remote.content || "",
                  meetUpPoints: remote.meetUpPoints || "",
                  aftermathProcedures: remote.aftermathProcedures || "",
                  other: remote.other || ""
                };
                setPlan(prev => ({
                  ...prev,
                  ...next
                }));
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
  const savePlan = useCallback(async next => {
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
          blank: ""
        };
        await addDoc(collection(db, "emergencyData"), {
          data: dataObj,
          dataType: "plans",
          username
        });
      } catch (e) {
        console.warn("myPlan: firestore save failed", e);
      }
    } catch (e) {
      console.warn("Failed to save plan", e);
    }
  }, []);
  const toggleEdit = key => {
    if (editing[key]) {
      const api = editorsApi.current[key];
      if (api && typeof api.saveAndClose === "function") {
        api.saveAndClose();
        return;
      }
    }
    setEditing(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // no automatic focus here — editor components manage focus when opened
  };
  const topPadding = Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top || 20;
  const Section = ({
    title,
    keyName
  }) => <View className={"bg-card p-[12px] rounded-[12px] mb-[12px] overflow-hidden shadow-sm"}>
      <View className="flex-row justify-between items-center">
        <Text className={"font-extrabold text-[16px] text-secondary-foreground"}>{title}</Text>
        <View className="flex-row gap-[8px]">
          <Button unstyled onPress={() => toggleEdit(keyName)} className={"bg-card border border-border px-[10px] py-[6px] rounded-[8px]"} accessibilityLabel={editing[keyName] ? "Close editor" : "Edit section"}>
            <MaterialCommunityIcons name={editing[keyName] ? "content-save" : "pencil"} size={18} color={palette.primary} />
          </Button>
          <Button unstyled onPress={() => openAiModal(title, keyName)} className={["bg-card border border-border px-[10px] py-[6px] rounded-[8px]", "ml-[8px]"].filter(Boolean).join(" ")} accessibilityLabel={`Ask AI about ${title}`}>
            <MaterialCommunityIcons name="map-marker-radius" size={18} color={palette.primary} />
          </Button>
        </View>
      </View>

          {editing[keyName] ? <PlanSectionEditor editorRegistry={editorsApi} plan={plan} sectionKey={keyName} title={title} onFocusChange={setCurrentFocusedKey} onSave={savePlan} setEditing={setEditing} /> : <View className={"pt-[8px]"}>
          {typeof plan[keyName] === "string" && /<[^>]+>/.test(plan[keyName]) ? <View className={"h-[160px] rounded-[8px] overflow-hidden bg-card"}>
              <WebView originWhitelist={["*"]} source={{
          html: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial; color:${palette.foreground}; background:${palette.card}; padding:8px; margin:0;} img{max-width:100%;height:auto;} p{line-height:1.45;}</style></head><body>${plan[keyName] || ""}</body></html>`
        }} className="flex-1" scalesPageToFit />
            </View> : <View className="min-h-[80px] p-2">
              <Markdown style={markdownStyles}>
                {decodeAiMarkdown(plan[keyName] || "_No content_")}
              </Markdown>
            </View>}
          {plan._meta?.[keyName] ? <Text className={"text-[12px] text-muted-foreground mt-[4px]"}>
              Last edited: {formatEdited(plan._meta[keyName])}
            </Text> : null}
        </View>}
    </View>;
  const formatEdited = iso => {
    try {
      if (!iso) return null;
      const d = new Date(iso);
      return d.toLocaleString();
    } catch (_error) {
      return null;
    }
  };
  const getLastSaved = () => {
    try {
      const meta = plan._meta || {};
      const times = Object.values(meta).filter(Boolean);
      if (times.length === 0) return null;
      const latest = times.map(t => new Date(t)).sort((a, b) => b - a)[0];
      return latest.toLocaleString();
    } catch (_error) {
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
    const defaultPrompt = keyName ? `Please evaluate and suggest improvements for the following section titled "${title}". Be concise and propose actionable items.` : `Please evaluate my full emergency plan and suggest improvements (clarity, missing items, prioritization).`;
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
          other: plan.other
        },
        target: aiTarget // null or keyName
      };

      // include the plan text inside the prompt for clearer context
      const fullPrompt = `${aiPrompt}\n\nCurrent plan content:\nEvacuation Route:\n${payload.plan.evacuateRoute || "(none)"}\n\nMeet-up Points:\n${payload.plan.meetUpPoints || "(none)"}\n\nAftermath Procedures:\n${payload.plan.aftermathProcedures || "(none)"}\n\nOther:\n${payload.plan.other || "(none)"}\n`;

      // Use the lightweight aiResponse helper which returns a text answer.
      const json = await getAiResponse(fullPrompt);
      const result = json?.result || json?.output || json?.text || (typeof json === "string" ? json : null);
      if (!result) {
        // If server returned unexpected shape, show debug info
        const debug = JSON.stringify(json).slice(0, 200);
        console.warn("submitAi: unexpected response shape from Gemini helper", debug);
        setAiResponse(`AI returned unexpected format: ${debug}`);
      } else {
        setAiResponse(result);
      }
    } catch (e) {
      // Show error details so you can see why the request failed
      console.warn("submitAi: sendGemini error", e);
      setAiResponse(`AI request failed: ${e?.message || e}`);
      // also keep fallback heuristic appended so user still gets guidance
      const content = aiTarget ? plan[aiTarget] || "" : `${plan.evacuateRoute || ""} ${plan.meetUpPoints || ""} ${plan.aftermathProcedures || ""} ${plan.other || ""}`;
      if (!content || content.trim().length < 50) {
        setAiResponse(prev => (prev ? prev + "\n\n" : "") + "Fallback: The content is sparse. Consider adding specific steps, exact meet-up coordinates, contact details, and responsibilities for each family member.");
      } else {
        setAiResponse(prev => (prev ? prev + "\n\n" : "") + "Fallback: High-level review: consider adding explicit actions, estimated timings, responsible persons, and alternative routes. Verify utility shutoff steps and special-needs provisions.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Helper: decode common HTML entities and undo backslash-escaping so
  // markdown renderers receive clean markdown text. Some AI responses may
  // return escaped characters (e.g. `\*\*bold\*\*` or HTML entities)
  // which prevents proper rendering.
  const decodeAiMarkdown = text => {
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
    txt = txt.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

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
    const next = {
      ...plan
    };
    if (aiTarget && typeof aiTarget === "string") {
      next[aiTarget] = (next[aiTarget] || "") + "\n\n" + aiResponse;
      const meta = {
        ...(next._meta || {})
      };
      meta[aiTarget] = new Date().toISOString();
      next._meta = meta;
      await savePlan(next);
    } else {
      // Append to 'other' for full plan suggestions
      next.other = (next.other || "") + "\n\n" + aiResponse;
      const meta = {
        ...(next._meta || {})
      };
      meta.other = new Date().toISOString();
      next._meta = meta;
      await savePlan(next);
    }
    setAiVisible(false);
  };
  const FullModal = () => {
    const lastSaved = getLastSaved();
    const combinedRaw = `${plan.evacuateRoute || ""}${plan.meetUpPoints || ""}${plan.aftermathProcedures || ""}${plan.other || ""}`;
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
    const wrapHtml = content => {
      const safe = content || "<p><em>No content</em></p>";
      return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial; color:${palette.foreground}; padding:12px; background:${palette.card};} img{max-width:100%;height:auto;} p{line-height:1.5;}</style></head><body>${safe}</body></html>`;
    };
    return <Modal visible={showFull} animationType="slide">
        <View className="flex-1 bg-background" style={{
        paddingTop: topPadding
      }}>
          
          <View className="flex-1 p-[18px]">
            <Text className={"text-[22px] font-extrabold text-primary mb-[6px]"}>Full Emergency Plan</Text>
            {lastSaved ? <Text className={"text-[12px] text-muted-foreground mt-[4px]"}>Last saved: {lastSaved}</Text> : null}
            <View className="flex-1 mt-[12px] rounded-[8px] overflow-hidden bg-card p-[12px]">
              {hasHtml ? <WebView originWhitelist={["*"]} source={{
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
                `)
            }} className="flex-1" /> : <ScrollView contentContainerClassName="p-[8px]">
                  <Markdown style={markdownStyles}>{markdownCombined}</Markdown>
                </ScrollView>}
            </View>

            <Button unstyled onPress={() => setShowFull(false)} className={["bg-primary py-[12px] rounded-[10px] items-center", "mt-[18px]"].filter(Boolean).join(" ")}>
              <Text className={"text-primary-foreground font-extrabold"}>Close</Text>
            </Button>
          </View>
        </View>
      </Modal>;
  };
  return <View className="flex-1 bg-background" style={{
    paddingTop: topPadding
  }}>
      
      <ScrollView contentContainerClassName="p-[18px]" keyboardShouldPersistTaps="handled">
        <Button unstyled onPress={() => navigation?.goBack?.()} className={"mb-[12px] self-start py-[8px] px-[12px] rounded-[10px] bg-card"}>
          <Text className={"text-primary font-bold"}>{"← Back"}</Text>
        </Button>

        <Text className={"text-[22px] font-extrabold text-primary mb-[6px]"}>My Emergency Plan</Text>
        <Text className={"text-muted-foreground mb-[12px]"}>
          Create and save a plan for emergency situations. Use the editor to
          format text (Markdown supported).
        </Text>
        <View className="flex-row gap-[8px] items-center">
          <Button unstyled onPress={() => setShowFull(true)} className={["bg-card border border-border px-[10px] py-[6px] rounded-[8px]", "bg-card mt-[8px] mb-[10px] self-start"].filter(Boolean).join(" ")}>
            <Text className={"text-primary font-bold"}>View Full Plan</Text>
          </Button>
          <Button unstyled onPress={() => openAiModal("Full Plan", null)} className={["bg-card border border-border px-[10px] py-[6px] rounded-[8px]", "bg-card mt-[8px] mb-[10px] self-start flex-row items-center"].filter(Boolean).join(" ")} accessibilityLabel="Ask AI to review full plan">
            <MaterialCommunityIcons name="map-marker-radius" size={16} color={palette.primary} />
            <Text className={["text-primary font-bold", "ml-[6px]"].filter(Boolean).join(" ")}>
              Ask AI
            </Text>
          </Button>
        </View>

        <Section title="Evacuation Route" keyName="evacuateRoute" />
        <Section title="Meet-up Points" keyName="meetUpPoints" />
        <Section title="Aftermath Procedures" keyName="aftermathProcedures" />
        <Section title="Other" keyName="other" />

        {showFull && <FullModal />}
      </ScrollView>
      {Platform.OS === "ios" && <InputAccessoryView nativeID={"planAccessory"}>
          <View className={"bg-card p-[10px] border-t border-border flex-row justify-end"}>
            <Button unstyled onPress={async () => {
          const k = currentFocusedKey;
          if (k && editorsApi.current[k] && typeof editorsApi.current[k].saveAndClose === "function") {
            await editorsApi.current[k].saveAndClose();
            setCurrentFocusedKey(null);
          } else {
            Keyboard.dismiss();
          }
        }} className={"py-[8px] px-[12px] rounded-[8px] bg-primary"}>
              <Text className={"text-primary-foreground font-bold"}>Done</Text>
            </Button>
          </View>
        </InputAccessoryView>}

      {/* AI Modal */}
      <Modal visible={aiVisible} animationType="slide" onRequestClose={() => setAiVisible(false)}>
        <View className="flex-1 bg-background" style={{
        paddingTop: topPadding
      }}>
          
          <View className="flex-1 p-[18px]">
            <Text className={"text-[22px] font-extrabold text-primary mb-[6px]"}>AI Review</Text>
            <Text className={"text-muted-foreground mb-[12px]"}>
              Ask the AI to evaluate or improve your plan. Edit the prompt or
              submit as-is.
            </Text>
            <Input value={aiPrompt} onChangeText={setAiPrompt} className={"min-h-[80px] border border-border p-[10px] rounded-[8px] bg-card mt-[8px]"} multiline placeholder="Enter instructions for the AI..." />

            <View className="flex-1 mt-[12px]">
              {aiLoading ? <ActivityIndicator size="large" color={palette.primary} /> : aiResponse ? <ScrollView contentContainerClassName="p-[8px]">
                  <Markdown style={markdownStyles}>
                    {decodeAiMarkdown(aiResponse)}
                  </Markdown>
                </ScrollView> : <Text className={"text-[12px] text-muted-foreground mt-[4px]"}>
                  No response yet. Press Ask AI to send your prompt.
                </Text>}
            </View>

            <View className="flex-row mt-[12px]">
              <Button unstyled onPress={submitAi} className={["bg-primary py-[12px] rounded-[10px] items-center", "flex-1 mr-[8px] bg-primary"].filter(Boolean).join(" ")}>
                <Text className={"text-primary-foreground font-extrabold"}>
                  {aiLoading ? "Asking..." : "Ask AI"}
                </Text>
              </Button>
              <Button unstyled onPress={applyAiSuggestion} className={["bg-card border border-border px-[10px] py-[6px] rounded-[8px]", "flex-1 items-center"].filter(Boolean).join(" ")}>
                <Text className={"text-primary font-bold"}>Apply Suggestion</Text>
              </Button>
            </View>

            <Button unstyled onPress={() => setAiVisible(false)} className={["bg-card border border-border px-[10px] py-[6px] rounded-[8px]", "mt-[12px] self-end"].filter(Boolean).join(" ")}>
              <Text className={"text-primary font-bold"}>Close</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>;
}
