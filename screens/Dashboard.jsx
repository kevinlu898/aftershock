import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, fontSizes } from "../css";
import { getData } from "../storage/storageUtils";
import { getPrepareModules } from "./Prepare/prepareModules";
import prepareStyles from "./Prepare/prepareStyles";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [firstVisit, setFirstVisit] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const [modules, setModules] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get("window");

  useEffect(() => {
    let isMounted = true;
    getData("firstname").then((val) => {
      if (isMounted && val) setUsername(val);
    });
    // Check if this is the first visit
    AsyncStorage.getItem("dashboardVisited").then((visited) => {
      if (isMounted && !visited) {
        setFirstVisit(true);
        AsyncStorage.setItem("dashboardVisited", "true");
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // fetch modules and compute overall progress (same approach as Prepare page)
  useEffect(() => {
    let mounted = true;
    const fetchModules = async () => {
      try {
        const ms = await getPrepareModules();
        if (!mounted) return;
        setModules(ms || []);
        if (ms && ms.length) {
          const avg =
            ms.reduce((acc, m) => acc + (Number(m.progress) || 0), 0) /
            ms.length;
          setOverallProgress(avg);
        } else setOverallProgress(0);
      } catch (e) {
        console.warn("Dashboard: failed to load modules", e);
      }
    };
    fetchModules();
    const off =
      navigation.addListener && navigation.addListener("focus", fetchModules);
    return () => {
      mounted = false;
      off && off();
    };
  }, [navigation]);

  const cards = [
    {
      title: "Continue Preparing",
      text: "Keep working on your earthquake plan.",
      icon: "clipboard-list",
      button: "Continue",
      onPress: () => navigation.navigate("Prepare"),
    },
    {
      title: "Review Plan",
      text: "Check your current preparedness steps.",
      icon: "account-check",
      button: "Review",
      onPress: () => navigation.navigate("Profile"),
    },
    {
      title: "Offline Access",
      text: "Use guides without wifi",
      icon: "wifi-off",
      button: "Open",
      onPress: () => navigation.navigate("Emergency"),
    },
    {
      title: "Epicenter AI",
      text: "Ask AI for instant help and advice.",
      icon: "robot",
      button: "Ask",
      onPress: () => navigation.navigate("Guide"),
    },
  ];

  const feedItems = [
    { icon: "check-circle", text: "Recent Activity", color: "#10B981" },
    { icon: "map-marker-radius", text: "Local Risk", color: "#EF4444" },
    { icon: "newspaper", text: "Earthquake News", color: "#3B82F6" },
  ];

  // Calculate proper centering
  const CARD_WIDTH = 280;
  const CARD_GAP = 8;
  const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
  const HORIZONTAL_PADDING = Math.max(
    0,
    Math.round((screenWidth - CARD_WIDTH) / 2)
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const dotIndex = Math.min(
          Math.round(offsetX / SNAP_INTERVAL),
          cards.length - 1
        );
        setActiveDot(dotIndex);
      },
    }
  );

  // ProgressBar reused locally to mirror Prepare page
  const ProgressBar = ({ progress }) => (
    <View style={prepareStyles.progressContainer}>
      <View
        style={[prepareStyles.progressFill, { width: `${progress * 100}%` }]}
      />
    </View>
  );

  // Get progress message based on preparedness level
  const getProgressMessage = (progress) => {
    if (progress === 0) return "Let's get started on your earthquake plan!";
    if (progress < 0.25) return "Great start! Keep building your safety plan.";
    if (progress < 0.5) return "You're making progress! Continue preparing.";
    if (progress < 0.75) return "Well done! You're becoming more prepared.";
    if (progress < 1)
      return "Almost there! Just a few steps to complete safety.";
    return "Excellent! You're fully prepared for earthquakes!";
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.light }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.welcomeHeading}>
              {firstVisit && username
                ? `Welcome to Aftershock, ${username}!`
                : username
                ? `Welcome back, ${username}!`
                : "Welcome back!"}
            </Text>
            <View
              style={[
                styles.progressContainer,
                { backgroundColor: colors.white },
              ]}
            >
              <View style={prepareStyles.progressHeader}>
                <Text style={prepareStyles.progressLabel}>
                  Prepare Progress
                </Text>
                <Text style={prepareStyles.progressPercent}>
                  {Math.round(overallProgress * 100)}%
                </Text>
              </View>
              <ProgressBar progress={overallProgress} />
              <Text style={styles.progressMessage}>
                {getProgressMessage(overallProgress)}
              </Text>
            </View>
          </View>

          {/* Horizontal Scroll Section with Dots */}
          <View style={styles.horizontalSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.horizontalScrollContent,
                {
                  paddingHorizontal: HORIZONTAL_PADDING,
                  backgroundColor: "transparent",
                },
              ]}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={SNAP_INTERVAL}
              snapToAlignment="start"
              bounces={false}
              overScrollMode="never"
            >
              {cards.map((item, idx) => (
                <View
                  key={item.title}
                  style={[
                    styles.horizontalCard,
                    { marginRight: idx === cards.length - 1 ? 0 : CARD_GAP },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={44}
                    color={colors.primary}
                    style={styles.horizontalCardIcon}
                  />
                  <Text style={styles.horizontalCardTitle}>{item.title}</Text>
                  <Text style={styles.horizontalCardBody}>{item.text}</Text>
                  <TouchableOpacity
                    onPress={item.onPress}
                    style={styles.horizontalCardButton}
                  >
                    <Text style={styles.horizontalCardButtonText}>
                      {item.button}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Scroll Indicator Dots */}
            <View style={styles.dotsContainer}>
              {cards.map((_, index) => (
                <TouchableOpacity key={index}>
                  <View
                    style={[
                      styles.dot,
                      index === activeDot && styles.activeDot,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Feed Section */}
          <View style={styles.feedSection}>
            <Text style={styles.sectionTitle}>Your Feed</Text>
            <View style={styles.feedGrid}>
              {feedItems.map((item, index) => (
                <View key={item.text} style={styles.feedItem}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={item.color}
                  />
                  <Text style={styles.feedText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeHeading: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  progressContainer: {
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: "100%",
  },
  progressMessage: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
    fontStyle: "italic",
  },
  progressText: {
    fontSize: fontSizes.large,
    fontWeight: "600",
    color: colors.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 10,
  },

  // Horizontal Scroll Section - Reduced padding
  horizontalSection: {
    marginBottom: 16,
  },
  horizontalScrollContent: {
    gap: 8,
  },
  horizontalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12, // Reduced from 14
    width: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 180,
  },
  horizontalCardIcon: {
    marginBottom: 12,
    alignSelf: "center",
  },
  horizontalCardTitle: {
    fontSize: 18,
    color: colors.secondary,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  horizontalCardBody: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
    flex: 1,
  },
  horizontalCardButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  horizontalCardButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Scroll Indicator Dots
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
    height: 8,
  },

  // Feed Section
  feedSection: {
    marginBottom: 24,
  },
  feedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  feedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  feedText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
});
