import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppIcon } from "../../components/app-icon";
import { StatusCard } from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { Image } from "expo-image";
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

function EpicenterAiIcon({ size = 20 }) {
  return (
    <Image
      source={require("../../../assets/images/filledEpicenter.png")}
      contentFit="contain"
      style={{ height: size, width: size }}
    />
  );
}

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
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
        setLoadError("Your emergency plan could not be loaded.");
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
    // Editor components manage focus when opened.
  };
  const topPadding = Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top || 20;
  const Section = ({
    title,
    keyName,
    icon
  }) => {
    const hasContent = Boolean(
      decodeAiMarkdown((plan[keyName] || "").replace(/<[^>]+>/g, "")).trim()
    );
    return <Card className="gap-4 overflow-hidden p-4">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary" style={{ borderCurve: "continuous" }}>
            <AppIcon name={icon} size={20} color={palette.primary} />
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-[17px] font-bold leading-[22px] text-foreground">{title}</Text>
            <Text className={hasContent ? "text-xs font-semibold text-primary" : "text-xs font-medium text-muted-foreground"}>
              {hasContent ? "Ready" : "Not started"}
            </Text>
          </View>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => toggleEdit(keyName)}
            accessibilityLabel={editing[keyName] ? `Save ${title}` : `Edit ${title}`}
          >
            <AppIcon name={editing[keyName] ? "content-save" : "pencil"} size={16} color={palette.primary} />
            <Text className="font-bold text-primary">{editing[keyName] ? "Save" : "Edit"}</Text>
          </Button>
        </View>

        {editing[keyName] ? (
          <PlanSectionEditor
            editorRegistry={editorsApi}
            plan={plan}
            sectionKey={keyName}
            title={title}
            onFocusChange={setCurrentFocusedKey}
            onSave={savePlan}
            setEditing={setEditing}
          />
        ) : (
          <View className="gap-3">
            {hasContent ? (
              typeof plan[keyName] === "string" && /<[^>]+>/.test(plan[keyName]) ? (
                <View className="h-[160px] overflow-hidden rounded-xl bg-card">
                  <WebView originWhitelist={["*"]} source={{
                    html: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial; color:${palette.foreground}; background:${palette.card}; padding:8px; margin:0;} img{max-width:100%;height:auto;} p{line-height:1.45;}</style></head><body>${plan[keyName] || ""}</body></html>`
                  }} className="flex-1" scalesPageToFit />
                </View>
              ) : (
                <View className="rounded-xl bg-muted px-4 py-3">
                  <Markdown style={markdownStyles}>
                    {decodeAiMarkdown(plan[keyName])}
                  </Markdown>
                </View>
              )
            ) : (
              <View className="rounded-xl bg-muted px-4 py-4">
                <Text className="text-sm leading-5 text-muted-foreground">
                  Add the details your household will need to follow this part of the plan.
                </Text>
              </View>
            )}
            <View className="flex-row items-center justify-between gap-3">
              {plan._meta?.[keyName] ? (
                <Text className="flex-1 text-xs text-muted-foreground">
                  Edited {formatEdited(plan._meta[keyName])}
                </Text>
              ) : <View className="flex-1" />}
              <Button
                unstyled
                onPress={() => openAiModal(title, keyName)}
                className="flex-row items-center gap-1.5 rounded-lg px-2 py-1.5 active:bg-secondary"
                accessibilityLabel={`Ask AI to review ${title}`}
              >
                <EpicenterAiIcon size={16} />
                <Text className="text-[13px] font-bold text-primary">AI review</Text>
              </Button>
            </View>
          </View>
        )}
      </Card>;
  };
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
          <View className="flex-1 gap-4 px-5 pb-6 pt-4">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary" style={{ borderCurve: "continuous" }}>
                <AppIcon name="clipboard-list" size={21} color={palette.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-xl font-extrabold text-foreground">Full emergency plan</Text>
                <Text className="text-xs text-muted-foreground">
                  {lastSaved ? `Last saved ${lastSaved}` : "Your complete household plan"}
                </Text>
              </View>
              <Button variant="ghost" size="icon" onPress={() => setShowFull(false)} accessibilityLabel="Close full plan">
                <AppIcon name="close" size={22} color={palette.foreground} />
              </Button>
            </View>
            <Card className="flex-1 overflow-hidden p-2">
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
            </Card>

            <Button onPress={() => setShowFull(false)}>
              <Text className="text-base font-bold text-primary-foreground">Done</Text>
            </Button>
          </View>
        </View>
      </Modal>;
  };
  if (loading) {
    return showSkeleton ? <ScreenSkeleton cards={4} /> : <View className="flex-1 bg-background" />;
  }
  if (loadError) {
    return (
      <View className="flex-1 justify-center bg-background p-5">
        <StatusCard tone="danger" title="Plan unavailable" description={loadError} />
      </View>
    );
  }
  const planSections = [
    { title: "Evacuation route", keyName: "evacuateRoute", icon: "viewport" },
    { title: "Meet-up points", keyName: "meetUpPoints", icon: "map-marker-radius" },
    { title: "Aftermath procedures", keyName: "aftermathProcedures", icon: "list-checks" },
    { title: "Other details", keyName: "other", icon: "clipboard-list" }
  ];
  const completedSections = planSections.filter(({ keyName }) =>
    Boolean(decodeAiMarkdown((plan[keyName] || "").replace(/<[^>]+>/g, "")).trim())
  ).length;

  return <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-6 px-5 py-6"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card className="gap-5 p-5">
          <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-secondary" style={{ borderCurve: "continuous" }}>
              <AppIcon name="clipboard-list" size={26} color={palette.primary} />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-lg font-bold text-foreground">Household emergency plan</Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                {completedSections} of {planSections.length} sections ready
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Text className="font-extrabold text-primary" style={{ fontVariant: ["tabular-nums"] }}>
                {Math.round((completedSections / planSections.length) * 100)}%
              </Text>
            </View>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${(completedSections / planSections.length) * 100}%` }}
            />
          </View>
          <View className="flex-row gap-3">
            <Button variant="secondary" className="flex-1" onPress={() => setShowFull(true)}>
              <AppIcon name="eye" size={18} color={palette.primary} />
              <Text className="font-bold text-primary">Full plan</Text>
            </Button>
            <Button variant="secondary" className="flex-1" onPress={() => openAiModal("Full Plan", null)} accessibilityLabel="Ask AI to review full plan">
              <EpicenterAiIcon size={18} />
              <Text className="font-bold text-primary">AI review</Text>
            </Button>
          </View>
        </Card>

        <View className="gap-1">
          <Text className="text-xl font-bold leading-6 text-foreground">Plan sections</Text>
          <Text className="text-[13px] leading-[18px] text-muted-foreground">
            Add practical instructions your household can follow.
          </Text>
        </View>

        <View className="gap-3">
          {planSections.map(section => <Section key={section.keyName} {...section} />)}
        </View>

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
          <View className="flex-1 gap-5 px-5 pb-6 pt-4">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary" style={{ borderCurve: "continuous" }}>
                <EpicenterAiIcon size={24} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-xl font-extrabold text-foreground">AI plan review</Text>
                <Text className="text-xs text-muted-foreground">
                  {aiTarget ? "Reviewing one plan section" : "Reviewing the full plan"}
                </Text>
              </View>
              <Button variant="ghost" size="icon" onPress={() => setAiVisible(false)} accessibilityLabel="Close AI review">
                <AppIcon name="close" size={22} color={palette.foreground} />
              </Button>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Review instructions</Text>
              <Input
                value={aiPrompt}
                onChangeText={setAiPrompt}
                className="min-h-[104px]"
                multiline
                placeholder="Enter instructions for the AI"
              />
            </View>

            <Card className="flex-1 overflow-hidden p-4">
              {aiLoading ? (
                <View className="flex-1 items-center justify-center gap-3">
                  <ActivityIndicator size="large" color={palette.primary} />
                  <Text className="text-sm font-medium text-muted-foreground">Reviewing your plan...</Text>
                </View>
              ) : aiResponse ? (
                <ScrollView contentContainerClassName="pb-2">
                  <Markdown style={markdownStyles}>
                    {decodeAiMarkdown(aiResponse)}
                  </Markdown>
                </ScrollView>
              ) : (
                <View className="flex-1 items-center justify-center gap-3 px-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <EpicenterAiIcon size={26} />
                  </View>
                  <Text className="text-center text-sm leading-5 text-muted-foreground">
                    Send the instructions above to get focused suggestions for your plan.
                  </Text>
                </View>
              )}
            </Card>

            <View className="flex-row gap-3">
              <Button className="flex-1" onPress={submitAi} loading={aiLoading}>
                <AppIcon name="send" size={17} color={palette.primaryForeground} />
                <Text className="font-bold text-primary-foreground">Review plan</Text>
              </Button>
              <Button variant="secondary" className="flex-1" onPress={applyAiSuggestion} disabled={!aiResponse || aiLoading}>
                <AppIcon name="check" size={17} color={palette.primary} />
                <Text className="font-bold text-primary">Apply</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>;
}
