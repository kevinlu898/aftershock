import { Button } from "./ui/button";
import { AppIcon } from "./app-icon";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseEarthquakeTime } from "../utils/earthquake";
const getMinutesAgo = value => {
  const timestamp = parseEarthquakeTime(value);
  if (timestamp === null) return null;
  return Math.max(0, Math.round((Date.now() - timestamp) / 60000));
};
export default function EmergencyBanner({
  lastEarthquakeTime,
  onPress
}) {
  const insets = useSafeAreaInsets();
  const minutesAgo = getMinutesAgo(lastEarthquakeTime);
  return <View className="z-[999] w-[100%] flex-row items-center gap-3 bg-destructive px-4 pb-3 shadow-sm" style={{
    paddingTop: Math.max(insets.top, 12)
  }}>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-white/15">
        <AppIcon name="alert-circle" size={22} color="#FFFFFF" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className={"text-primary-foreground text-[15px] font-extrabold"}>Emergency alert</Text>
        <Text className={"text-primary-foreground text-[12px] leading-[17px]"}>
          {minutesAgo === null ? "Open the Emergency hub for guidance." : `Earthquake activity was detected near you about ${minutesAgo} minutes ago.`}
        </Text>
      </View>
      <Button variant="secondary" size="sm" onPress={onPress} accessibilityLabel="Open Emergency hub">
        Open
      </Button>
    </View>;
}
