import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const supported = Platform.OS === "ios" || Platform.OS === "android";

function run(fn) {
  if (!supported) return;
  try {
    const result = fn();
    if (result && typeof result.catch === "function") result.catch(() => {});
  } catch {}
}

const haptics = {
  selection: () => run(() => Haptics.selectionAsync()),

  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  medium: () =>
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  success: () =>
    run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    ),

  warning: () =>
    run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    ),

  error: () =>
    run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    ),
};

export default haptics;
