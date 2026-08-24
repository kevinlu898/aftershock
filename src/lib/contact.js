import { Linking, Platform } from "react-native";
import haptics from "./haptics";

export function toDialable(value) {
  if (!value) return null;
  const cleaned = String(value)
    .replace(/[^\d+*#,]/g, "")
    .replace(/(?!^)\+/g, "");
  return cleaned.length >= 3 ? cleaned : null;
}

export function isDialable(value) {
  return toDialable(value) !== null;
}

export async function callNumber(value) {
  const number = toDialable(value);
  if (!number) return false;

  const url = `tel:${number}`;
  try {
    if (Platform.OS === "ios") {
      const supported = await Linking.canOpenURL(url);
      if (!supported) return false;
    }
    haptics.light();
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.warn("Failed to start call", error);
    return false;
  }
}

export const EMERGENCY_SERVICES_NUMBER = "911";
