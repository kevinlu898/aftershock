import { Button } from "./ui/button";
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
  return <View className={["items-center bg-destructive shadow-sm justify-center py-[8px] w-[100%] z-[999]"].filter(Boolean).join(" ")} style={{
    paddingTop: insets.top || 12
  }}>
      <Text className={"text-primary-foreground text-[16px] font-extrabold"}>EMERGENCY ALERT</Text>
      <Text className={"text-primary-foreground text-[12px] mt-[2px]"}>
        {minutesAgo === null ? "Go to the Emergency page." : `An earthquake occurred near you around ${minutesAgo} minutes ago.`}
      </Text>
      <Button unstyled onPress={onPress}>
        <Text className={"text-primary-foreground text-[12px] mt-[2px] underline"}>Open Emergency</Text>
      </Button>
    </View>;
}
