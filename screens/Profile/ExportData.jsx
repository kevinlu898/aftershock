import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, fontSizes, globalStyles } from "../../css";
import { exportData } from "../../requests";

export default function ExportData({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const USAGE_KEY = "export_data_usage";
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    setLoading(true);
    try {
      // load usage
      let usage = { date: today, count: 0 };
      try {
        const raw = await AsyncStorage.getItem(USAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            parsed.date === today &&
            typeof parsed.count === "number"
          ) {
            usage = parsed;
          } else if (parsed && parsed.date !== today) {
            usage = { date: today, count: 0 };
          }
        }
      } catch (_e) {
        // ignore storage read errors
      }

      if (usage.count >= 2) {
        Alert.alert(
          "Limit reached",
          "You can request an export a maximum of 2 times per day. Please try again tomorrow."
        );
        return;
      }

      // Tentatively increment count (will rollback on failure)
      usage.count += 1;
      try {
        await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage));
      } catch (_e) {
        // ignore store errors
      }

      try {
        const data = await exportData();
        const msg =
          (data && (data.message || data.msg)) || "Export request submitted.";
        Alert.alert("Export", String(msg));
      } catch (err) {
        console.warn("Export failed", err);
        // rollback usage increment
        try {
          const raw = await AsyncStorage.getItem(USAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            const newCount =
              parsed &&
              parsed.date === today &&
              typeof parsed.count === "number"
                ? Math.max(0, parsed.count - 1)
                : 0;
            await AsyncStorage.setItem(
              USAGE_KEY,
              JSON.stringify({ date: today, count: newCount })
            );
          }
        } catch (_e) {}
        Alert.alert(
          "Export failed",
          err?.message || "Unable to request export."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <View>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={{
            marginBottom: 12,
            alignSelf: "flex-start",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: "700" }}>
            {"← Back"}
          </Text>
        </TouchableOpacity>
        <Text style={globalStyles.heading}>Export your data</Text>
        <Text
          style={{
            color: colors.muted,
            marginTop: 8,
            fontSize: fontSizes.medium,
          }}
        >
          Request a copy of your account data. The server will prepare an export
          and respond with details. This may take a few moments.
        </Text>

        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={handleExport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: "#fff",
                fontSize: fontSizes.large,
                fontWeight: "700",
              }}
            >
              Export Data
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
