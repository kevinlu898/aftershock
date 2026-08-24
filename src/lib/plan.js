import AsyncStorage from "@react-native-async-storage/async-storage";

export const PLAN_STORAGE_KEY = "my_plan";

export const PLAN_SECTIONS = [
  { key: "evacuateRoute", title: "Evacuation route" },
  { key: "meetUpPoints", title: "Meet-up points" },
  { key: "aftermathProcedures", title: "Aftermath procedures" },
  { key: "other", title: "Other details" },
];

export function htmlToPlainText(html) {
  if (!html) return "";
  return String(html)
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|h[1-6]|tr)\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

export async function loadPlanSections() {
  try {
    const raw = await AsyncStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return PLAN_SECTIONS.map(({ key, title }) => ({
      key,
      title,
      body: htmlToPlainText(parsed?.[key]),
    })).filter((section) => section.body.length > 0);
  } catch (error) {
    console.warn("Failed to load emergency plan", error);
    return [];
  }
}
