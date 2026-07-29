import { Button } from "../../components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { exportData } from "../../lib/api";
export default function ExportData({
  navigation
}) {
  const [loading, setLoading] = useState(false);
  const handleExport = async () => {
    const USAGE_KEY = "export_data_usage";
    const today = new Date().toISOString().slice(0, 10);
    setLoading(true);
    try {
      let usage = {
        date: today,
        count: 0
      };
      try {
        const raw = await AsyncStorage.getItem(USAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.date === today && typeof parsed.count === "number") {
            usage = parsed;
          } else if (parsed && parsed.date !== today) {
            usage = {
              date: today,
              count: 0
            };
          }
        }
      } catch (_e) {
        // ignore 
      }
      if (usage.count >= 4) {
        Alert.alert("Limit reached", "You can request an export a maximum of 2 times per day. Please try again tomorrow.");
        return;
      }
      usage.count += 1;
      try {
        await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage));
      } catch (_e) {
        // ignore
      }
      try {
        const data = await exportData();
        const msg = data && (data.message || data.msg) || "Export request submitted.";
        Alert.alert("Export", String(msg));
      } catch (err) {
        console.warn("Export failed", err);
        try {
          const raw = await AsyncStorage.getItem(USAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            const newCount = parsed && parsed.date === today && typeof parsed.count === "number" ? Math.max(0, parsed.count - 1) : 0;
            await AsyncStorage.setItem(USAGE_KEY, JSON.stringify({
              date: today,
              count: newCount
            }));
          }
        } catch (_e) {}
        Alert.alert("Export failed", err?.message || "Unable to request export.");
      }
    } finally {
      setLoading(false);
    }
  };
  return <ScrollView className={"flex-1 p-[20px] pt-[32px] bg-background"} contentContainerClassName="p-0">
      <View>
        <Button unstyled onPress={() => navigation?.goBack?.()} className="mb-[12px] self-start py-[8px] px-[12px] rounded-[10px] bg-card">
          <Text className="text-primary font-bold">
            {"← Back"}
          </Text>
        </Button>

        <View className={"bg-card p-[18px] rounded-[14px] shadow-sm mb-[12px]"}>
          <Text className={"text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"}>Export Data</Text>
          <Text className="text-muted-foreground mt-[8px] text-base">
            Send a copy of all your emergency data to your email. This will take a few moments to prepare your export. 
          </Text>

          <Button unstyled className="mt-[20px] bg-primary py-[14px] rounded-[8px] items-center" onPress={handleExport} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-primary-foreground text-base font-bold">
                Export Data
              </Text>}
          </Button>
        </View>
      </View>
    </ScrollView>;
}
