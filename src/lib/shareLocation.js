import * as Location from "expo-location";
import { Share } from "react-native";

export async function shareCurrentLocation() {
  let permission;
  try {
    permission = await Location.requestForegroundPermissionsAsync();
  } catch (error) {
    console.warn("Location permission request failed", error);
    return { ok: false, reason: "unavailable" };
  }

  if (permission?.status !== "granted") {
    return { ok: false, reason: "denied" };
  }

  let position;
  try {
    position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch (error) {
    console.warn("Failed to read position", error);
    return { ok: false, reason: "no-fix" };
  }

  const { latitude, longitude } = position.coords;
  const coords = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

  let place = null;
  try {
    const results = await Location.reverseGeocodeAsync(position.coords);
    const first = results?.[0];
    if (first) {
      place = [first.name, first.city, first.region]
        .filter(Boolean)
        .join(", ");
    }
  } catch {}

  const message = [
    "I'm sharing my location after an earthquake.",
    place ? `Near: ${place}` : null,
    `Coordinates: ${coords}`,
    mapUrl,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await Share.share({ message });
    return { ok: true };
  } catch (error) {
    console.warn("Share sheet failed", error);
    return { ok: false, reason: "share-failed" };
  }
}

export const LOCATION_FAILURE_MESSAGES = {
  denied: {
    title: "Location access needed",
    description: "Allow location access in your device settings to share where you are.",
  },
  "no-fix": {
    title: "Couldn’t get a location fix",
    description: "Move somewhere with a clearer view of the sky and try again.",
  },
  unavailable: {
    title: "Location isn’t available",
    description: "This device wouldn’t report a position.",
  },
  "share-failed": {
    title: "Couldn’t open the share sheet",
    description: "Try again, or send your coordinates manually.",
  },
};
