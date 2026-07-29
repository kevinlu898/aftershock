import { Button } from "../../components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StatusBar, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
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
    return <View className={"flex-1 justify-center items-center p-[16px]"}>
        <ActivityIndicator size="large" color={"#25745A"} />
        <Text className={"mt-[12px] text-primary"}>Loading local earthquake info…</Text>
      </View>;
  }
  if (error) {
    return <View className={"flex-1 justify-center items-center p-[16px]"}>
        <Text className={"text-destructive font-bold mb-[10px]"}>Failed to load earthquake data</Text>
        <Text className={"text-foreground bg-muted p-[10px] rounded-[8px]"}>{error}</Text>
      </View>;
  }
  const place = earthquakeData?.place;
  const mag = earthquakeData?.mag;
  const time = earthquakeData?.timeISO;
  const depth = earthquakeData?.depth;
  const topPadding = Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top || 20;
  return <View className="flex-1 bg-background" style={{
    paddingTop: topPadding
  }}>
      
      <ScrollView contentContainerClassName={"grow"}>
        <View className={["flex-1 p-[18px] pt-[28px]", "pt-[8px]"].filter(Boolean).join(" ")}>
          <Button unstyled onPress={() => navigation?.goBack?.()} className={"mb-[12px] self-start py-[8px] px-[12px] rounded-[12px] bg-card border border-border"}>
            <Text className={"text-primary font-bold"}>{"← Back"}</Text>
          </Button>
          <View className={"bg-card p-[18px] rounded-[18px] mb-[14px] shadow-sm border border-border"}>
            <Text className={"text-[20px] font-extrabold mb-[8px] text-primary"}>Local Earthquake Risk</Text>
            <Text className={"text-[16px] text-secondary-foreground mb-[12px]"}>{place ?? "No recent events"}</Text>
            <View className={"flex-row justify-between mb-[10px] items-center"}>
              <Text className={"text-muted-foreground text-[14px]"}>Magnitude:</Text>
              <Text className={"font-bold text-secondary-foreground text-[15px]"}>{mag ?? "—"}</Text>
            </View>
            <View className={"flex-row justify-between mb-[10px] items-center"}>
              <Text className={"text-muted-foreground text-[14px]"}>Depth:</Text>
              <Text className={"font-bold text-secondary-foreground text-[15px]"}>{depth ?? "—"} km</Text>
            </View>
            <View className={"flex-row justify-between mb-[10px] items-center"}>
              <Text className={"text-muted-foreground text-[14px]"}>Time:</Text>
              <Text className={"font-bold text-secondary-foreground text-[15px]"}>
                {time ? new Date(time).toLocaleString() : "—"}
              </Text>
            </View>
          </View>

          {riskData && <View className={["bg-card p-[14px] rounded-[18px] mb-[12px] shadow-sm border border-border", "mt-[16px]"].filter(Boolean).join(" ")}>
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
            </View>}
        </View>
      </ScrollView>
    </View>;
}
