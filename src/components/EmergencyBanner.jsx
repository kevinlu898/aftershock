import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "./app-icon";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { parseEarthquakeTime } from "../utils/earthquake";

const getMinutesAgo = (value) => {
  const timestamp = parseEarthquakeTime(value);
  if (timestamp === null) return null;
  return Math.max(0, Math.round((Date.now() - timestamp) / 60000));
};

function buildSummary({ minutesAgo, magnitude, place }) {
  if (minutesAgo === null && magnitude === null) {
    return "Open the Emergency hub for guidance.";
  }

  const parts = [];
  if (Number.isFinite(magnitude)) parts.push(`Magnitude ${magnitude.toFixed(1)}`);
  if (place) parts.push(place);

  const when =
    minutesAgo === null
      ? null
      : minutesAgo < 1
        ? "just now"
        : `${minutesAgo} min ago`;

  if (!parts.length) return `Earthquake activity detected near you ${when}.`;
  return when ? `${parts.join(" · ")} · ${when}` : parts.join(" · ");
}

export default function EmergencyBanner({
  lastEarthquakeTime,
  magnitude,
  place,
  onPress,
  onPressContacts,
  onDismiss,
}) {
  const insets = useSafeAreaInsets();
  const minutesAgo = getMinutesAgo(lastEarthquakeTime);
  const summary = buildSummary({ minutesAgo, magnitude, place });

  return (
    <View
      className="z-[999] w-full flex-row items-center gap-3 bg-destructive px-4 pb-3 shadow-card"
      style={{ paddingTop: Math.max(insets.top, 12) }}
      accessibilityLiveRegion="assertive"
      role="alert"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-white/15">
        <AppIcon name="alert-circle" size={22} color="#FFFFFF" />
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-body font-extrabold text-destructive-foreground">
          Earthquake alert
        </Text>
        <Text className="text-caption text-destructive-foreground">
          {summary}
        </Text>
      </View>

      {onPressContacts ? (
        <Button
          unstyled
          onPress={onPressContacts}
          className="h-11 w-11 items-center justify-center rounded-full bg-white/15 active:bg-white/25"
          accessibilityLabel="Open emergency contacts"
          accessibilityHint="Goes straight to the people you would call"
          hitSlop={4}
        >
          <AppIcon name="phone" size={19} color="#FFFFFF" />
        </Button>
      ) : null}

      <Button
        variant="secondary"
        size="sm"
        onPress={onPress}
        accessibilityLabel="Open Emergency hub"
        accessibilityHint="Shows your contacts, medical information and what to do now"
      >
        Open
      </Button>

      {onDismiss ? (
        <Button
          unstyled
          onPress={onDismiss}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-white/15"
          accessibilityLabel="Dismiss alert"
          accessibilityHint="Hides this alert until the next earthquake"
          hitSlop={6}
        >
          <AppIcon name="close" size={20} color="#FFFFFF" />
        </Button>
      ) : null}
    </View>
  );
}
