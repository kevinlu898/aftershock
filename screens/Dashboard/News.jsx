import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../css";
import { fetchNews } from "../../requests";

export default function News({ navigation }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const topPadding =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top || 20;
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const newsData = await fetchNews();
        if (!mounted) return;
        setNews(Array.isArray(newsData) ? newsData : []);
      } catch (e) {
        console.warn("Failed to fetch news", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
    );

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{"← Back"}</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Earthquake News</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {news.length === 0 && (
            <Text style={styles.empty}>No news available.</Text>
          )}
          <Text style={styles.textDescription}>
            Your feed of relevant earthquake news worldwide.
          </Text>
          {news.map((story, idx) => (
            <View key={story.id ?? story.title ?? idx} style={styles.card}>
              <Text style={styles.cardTitle}>{story.title}</Text>
              {story.summary ? (
                <Text style={styles.cardBody}>{story.summary}</Text>
              ) : null}
              {!story.summary && story.description ? (
                <Text style={styles.cardBody}>{story.description}</Text>
              ) : null}
              {story.url ? (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const supported = await Linking.canOpenURL(story.url);
                      if (supported) {
                        await Linking.openURL(story.url);
                      } else {
                        console.warn("Can't open URL:", story.url);
                      }
                    } catch (e) {
                      console.warn("Failed to open URL:", e);
                    }
                  }}
                  style={styles.readMoreButton}
                >
                  <Text style={styles.readMoreText}>Read more</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: 18, paddingTop: 28 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 12,
  },
  dateText: { color: colors.muted, marginBottom: 12 },
  textDescription: { color: colors.secondary, marginBottom: 12 },
  empty: { color: colors.muted, fontStyle: "italic" },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
  },
  cardBody: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  readMoreButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  readMoreText: { color: "#fff", fontWeight: "700" },
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
