import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import {
  PageHeader,
  StatusCard,
} from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useTheme } from "../../lib/theme";
import { fetchEarthquakeData } from "../../lib/api";
import { getRisk } from "../../lib/storage/storageUtils";
export default function LocalRisk({
  navigation
}) {
  const {
    palette
  } = useTheme();
  const [earthquakeData, setEarthquakeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const formatRiskData = data => {
    try {
      if (typeof data === "string") {
        let s = data;
        if (s.startsWith('"') && s.endsWith('"')) {
          s = s.slice(2, -2);
        } else if (s.startsWith('"') && s.endsWith('"')) {
          s = s.slice(1, -1);
        }
        s = s.replace(/\\n/g, "\n");
        return s;
      }
      return JSON.stringify(data, null, 2);
    } catch (_e) {
      return String(data);
    }
  };
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const rawPostal = await AsyncStorage.getItem("postalcode");
        const postal_code = Number(rawPostal) || 95425;
        const data = await fetchEarthquakeData(postal_code);
        setEarthquakeData(data.results?.[0] || null);
        setRiskData(await getRisk(postal_code));
      } catch (err) {
        console.error("Error fetching earthquake data:", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);
  if (loading) {
    return showSkeleton ? <ScreenSkeleton cards={2} /> : <View className="flex-1 bg-background" />;
  }
  if (error) {
    return <View className={"flex-1 justify-center bg-background p-[20px]"}>
        <StatusCard
          tone="danger"
          title="Local risk is unavailable"
          description="We could not load current earthquake information. Check your connection and try again."
        >
          <Text selectable className="text-[13px] text-destructive">{error}</Text>
        </StatusCard>
      </View>;
  }
  const place = earthquakeData?.place;
  const mag = earthquakeData?.mag;
  const time = earthquakeData?.timeISO;
  const depth = earthquakeData?.depth;
  return <View className="flex-1 bg-background">
      
      <ScrollView contentContainerClassName={"grow"} contentInsetAdjustmentBehavior="automatic">
        <View className="flex-1 gap-[20px] p-[20px]">
          <PageHeader title="Local risk snapshot" />
          <Card>
            <Text className={"text-[18px] font-bold text-foreground"}>{place ?? "No recent events"}</Text>
            <View className={"flex-row justify-between mb-[10px] items-center"}>
              <Text className={"text-muted-foreground text-[14px]"}>Magnitude</Text>
              <Text selectable className={"font-bold text-secondary-foreground text-[15px]"} style={{ fontVariant: ["tabular-nums"] }}>{mag ?? "Not available"}</Text>
            </View>
            <View className={"flex-row justify-between mb-[10px] items-center"}>
              <Text className={"text-muted-foreground text-[14px]"}>Depth</Text>
              <Text selectable className={"font-bold text-secondary-foreground text-[15px]"}>{depth != null ? `${depth} km` : "Not available"}</Text>
            </View>
            <View className={"flex-row justify-between mb-[10px] items-center"}>
              <Text className={"text-muted-foreground text-[14px]"}>Time</Text>
              <Text selectable className={"font-bold text-secondary-foreground text-[15px]"}>
                {time ? new Date(time).toLocaleString() : "Not available"}
              </Text>
            </View>
          </Card>

          {riskData && <Card>
              <Text className={"font-bold mb-[8px] text-secondary-foreground"}>Local Risk Data</Text>
              <ScrollView className="max-h-[300px]">
                <Markdown style={{
              body: {
                color: palette.foreground,
                fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                fontSize: 13
              }
            }}>
                  {formatRiskData(riskData)}
                </Markdown>
              </ScrollView>
            </Card>}
        </View>
      </ScrollView>
    </View>;
}
