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
    setLoading(true);
    try {
      const data = await exportData();
      const msg =
        (data && (data.message || data.msg)) || "Export request submitted.";
      Alert.alert("Export", String(msg));
    } catch (err) {
      console.warn("Export failed", err);
      Alert.alert("Export failed", err?.message || "Unable to request export.");
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
