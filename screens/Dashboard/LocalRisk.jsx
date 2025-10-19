import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../css";
import { fetchEarthquakeData } from "../../requests";
import { getRisk } from "../../storage/storageUtils";

export default function LocalRisk({ navigation }) {
  const [earthquakeData, setEarthquakeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const insets = useSafeAreaInsets();

  // Helper: pretty-print and sanitize riskData for display
  const formatRiskData = (data) => {
    try {
      if (typeof data === "string") {
        // Remove surrounding quotes if present and unescape literal "\n" sequences
        let s = data;
        if (s.startsWith('"') && s.endsWith('"')) {
          s = s.slice(2, -2);
        } else if (s.startsWith('"') && s.endsWith('"')) {
          s = s.slice(1, -1);
        }
        // Replace escaped newline sequences with real newlines
        s = s.replace(/\\n/g, "\n");
        return s;
      }
      // For objects, pretty-print JSON
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
        console.log(postal_code);
        const data = await fetchEarthquakeData(postal_code);
        console.log("syzygy");
        console.log(data.results?.[0]);
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
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#519872" />
        <Text style={styles.loadingText}>Loading local earthquake info…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load earthquake data</Text>
        <Text style={styles.mono}>{error}</Text>
      </View>
    );
  }

  // Attempt to extract some common fields depending on API shape
  const place = earthquakeData?.place;
  const mag = earthquakeData?.mag;
  const time = earthquakeData?.timeISO;
  const depth = earthquakeData?.depth;

  const topPadding =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top || 20;

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.light, paddingTop: topPadding }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.light}
        translucent={false}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.container, { paddingTop: 8 }]}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{"← Back"}</Text>
          </TouchableOpacity>
          <View style={styles.card}>
            <Text style={styles.title}>Local Earthquake Risk</Text>
            <Text style={styles.place}>{place ?? "No recent events"}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Magnitude:</Text>
              <Text style={styles.value}>{mag ?? "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Depth:</Text>
              <Text style={styles.value}>{depth ?? "—"} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>
                {time ? new Date(time).toLocaleString() : "—"}
              </Text>
            </View>
          </View>

          {riskData && (
            <View style={[styles.detailsCard, { marginTop: 16 }]}>
              <Text style={styles.detailsTitle}>Local Risk Data</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                <Markdown style={styles.mono}>
                  {formatRiskData(riskData)}
                </Markdown>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: 18, paddingTop: 28 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  loadingText: { marginTop: 12, color: colors.primary },
  errorText: { color: "#D02424", fontWeight: "700", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8, color: colors.primary },
  place: { fontSize: 16, color: colors.secondary, marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  label: { color: colors.muted, fontSize: 14 },
  value: { fontWeight: "700", color: colors.secondary, fontSize: 15 },
  detailsCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  detailsTitle: { fontWeight: "700", marginBottom: 8, color: colors.secondary },
  mono: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#374151",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: "700",
  },
});
