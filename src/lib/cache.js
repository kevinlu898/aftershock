import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "cache:";

export async function readCache(key) {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return { value: parsed.value, cachedAt: parsed.cachedAt || null };
  } catch (error) {
    console.warn("Failed to read cache", key, error);
    return null;
  }
}

export async function writeCache(key, value) {
  try {
    await AsyncStorage.setItem(
      PREFIX + key,
      JSON.stringify({ value, cachedAt: new Date().toISOString() })
    );
  } catch (error) {
    console.warn("Failed to write cache", key, error);
  }
}

export function formatCachedAt(iso) {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  return new Date(then).toLocaleDateString();
}
