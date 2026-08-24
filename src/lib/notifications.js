import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

let configured = false;

function configure() {
  if (configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("earthquake-alerts", {
      name: "Earthquake alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    }).catch((error) => {
      console.warn("Failed to create notification channel", error);
    });
  }
}

export async function hasNotificationPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function presentEarthquakeAlert({ magnitude, place }) {
  try {
    if (!(await hasNotificationPermission())) return false;
    configure();

    const title = Number.isFinite(magnitude)
      ? `Magnitude ${magnitude.toFixed(1)} earthquake`
      : "Earthquake detected";

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: place
          ? `${place}. Drop, Cover, and Hold On.`
          : "Drop, Cover, and Hold On. Open Aftershock for guidance.",
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: "earthquake-alert" },
      },
      trigger: null,
    });
    return true;
  } catch (error) {
    console.warn("Failed to present earthquake alert", error);
    return false;
  }
}

export default { hasNotificationPermission, presentEarthquakeAlert };
