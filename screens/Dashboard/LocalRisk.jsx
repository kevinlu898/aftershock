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
import { colors } from "../../css";
import { fetchEarthquakeData } from "../../requests";

export default function LocalRisk({ navigation }) {
  const [earthquakeData, setEarthquakeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const data = await fetchEarthquakeData(95425);
        setEarthquakeData(data);
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
  const place = earthquakeData?.place || earthquakeData?.properties?.place;
  const mag =
    earthquakeData?.mag ||
    earthquakeData?.properties?.mag ||
    earthquakeData?.properties?.mag?.value;
  const time = earthquakeData?.time || earthquakeData?.properties?.time;
  const depth =
    earthquakeData?.depth || earthquakeData?.geometry?.coordinates?.[2];

  return (
    <View style={{ flex: 1, backgroundColor: colors.light }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.light}
        translucent={false}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
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

          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Raw data</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.mono}>
                {JSON.stringify(earthquakeData, null, 2)}
              </Text>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: 16, paddingTop: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#555" },
  errorText: { color: "#D02424", fontWeight: "600", marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  place: { fontSize: 16, color: "#333", marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { color: "#666" },
  value: { fontWeight: "700", color: "#111" },
  detailsCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
  },
  detailsTitle: { fontWeight: "700", marginBottom: 8 },
  mono: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#333",
  },
  backButton: {
    marginBottom: 8,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: "#519872",
    fontWeight: "600",
  },
});
