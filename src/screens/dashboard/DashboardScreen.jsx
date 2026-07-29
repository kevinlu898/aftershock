import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Animated, AppState, Image, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { APP_ICONS, AppIcon } from "../../components/app-icon";
import {
  ListRow,
  PageHeader,
  SectionHeader,
  StatusCard,
} from "../../components/app-ui";
import { getData } from "../../lib/storage/storageUtils";
import { getPrepareModules } from "../../lib/prepareModules";
import { useTheme } from "../../lib/theme";
export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [firstVisit, setFirstVisit] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const [, setModules] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const navigation = useNavigation();
  const { palette } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = useWindowDimensions();
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    let isMounted = true;
    getData("firstname").then(val => {
      if (isMounted && val) setUsername(val);
    });
    AsyncStorage.getItem("dashboardVisited").then(visited => {
      if (isMounted && !visited) {
        setFirstVisit(true);
        AsyncStorage.setItem("dashboardVisited", "true");
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate prepardness progress
  useEffect(() => {
    let mounted = true;
    const fetchModules = async () => {
      try {
        setLoadError(null);
        const ms = await getPrepareModules();
        if (!mounted) return;
        setModules(ms || []);
        if (ms && ms.length) {
          const avg = ms.reduce((acc, m) => acc + (Number(m.progress) || 0), 0) / ms.length;
          setOverallProgress(avg);
        } else setOverallProgress(0);
      } catch (e) {
        console.warn("Dashboard: failed to load modules", e);
        setLoadError("Preparedness progress could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchModules();
    const off = navigation.addListener && navigation.addListener("focus", fetchModules);
    return () => {
      mounted = false;
      off && off();
    };
  }, [navigation]);

  // Update Async Storage with data from database on load
  const syncModulesToStorage = async () => {
    try {
      const ms = await getPrepareModules();
      if (ms && Array.isArray(ms)) {
        setModules(ms);
        const avg = ms.reduce((acc, m) => acc + (Number(m.progress) || 0), 0) / Math.max(1, ms.length);
        setOverallProgress(avg);
        try {
          await AsyncStorage.setItem("prepare_modules_cache", JSON.stringify(ms));
        } catch (_e) {
          // ignore local persist errors
        }
      }
    } catch (e) {
      console.warn("Dashboard: syncModulesToStorage failed", e);
    }
  };
  useEffect(() => {
    const handleAppState = nextState => {
      if (appStateRef.current.match(/inactive|background/) && nextState === "active") {
        syncModulesToStorage();
      }
      appStateRef.current = nextState;
    };
    const sub = AppState.addEventListener ? AppState.addEventListener("change", handleAppState) : null;
    syncModulesToStorage();
    return () => {
      sub && sub.remove && sub.remove();
    };
  }, []);

  // Quick action cards
  const cards = [{
    title: "Continue Preparing",
    text: "Keep working on your earthquake plan.",
    icon: "clipboard-list",
    button: "Continue",
    onPress: () => navigation.navigate("Prepare")
  }, {
    title: "Review Plan",
    text: "Check your current preparedness steps.",
    icon: "account-check",
    button: "Review",
    onPress: () => navigation.navigate("myPlan")
  }, {
    title: "Offline Access",
    text: "Use emergency resources without Wi-Fi",
    icon: "wifi-off",
    button: "Open",
    onPress: () => navigation.navigate("Emergency")
  }, {
    title: "Epicenter AI",
    text: "Ask AI for instant help and advice.",
    iconImage: require("../../../assets/images/filledEpicenter.png"),
    button: "New Chat",
    onPress: () => navigation.navigate("EpicenterAI")
  }];

  // Your feed
  const feedItems = [{
    icon: "map-marker-radius",
    text: "Local Risk",
    color: palette.destructive,
    onPress: () => navigation.navigate("LocalRisk")
  }, {
    icon: "newspaper",
    text: "Earthquake News",
    color: palette.primary,
    onPress: () => navigation.navigate("News")
  }];
  const CARD_WIDTH = Math.min(320, Math.max(260, screenWidth - 56));
  const CARD_GAP = 12;
  const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
  const HORIZONTAL_PADDING = 0;
  const handleScroll = Animated.event([{
    nativeEvent: {
      contentOffset: {
        x: scrollX
      }
    }
  }], {
    useNativeDriver: false,
    listener: event => {
      const {
        nativeEvent: {
          contentOffset: {
            x: offsetX
          }
        } = {}
      } = event || {};
      const dotIndex = Math.min(Math.round((offsetX || 0) / SNAP_INTERVAL), cards.length - 1);
      setActiveDot(dotIndex);
    }
  });

  // Progress message
  const getProgressMessage = progress => {
    if (progress === 0) return "Let's get started on your earthquake plan!";
    if (progress < 0.25) return "Great start! Keep building your safety plan.";
    if (progress < 0.5) return "You're making progress! Continue preparing.";
    if (progress < 0.75) return "Well done! You're becoming more prepared.";
    if (progress < 1) return "Almost there! Just a few steps to complete safety.";
    return "Excellent! You're fully prepared for earthquakes!";
  };
  if (loading) {
    return showSkeleton ? <ScreenSkeleton cards={4} /> : <View className="flex-1 bg-background" />;
  }
  if (loadError) {
    return (
      <View className="flex-1 justify-center bg-background p-5">
        <StatusCard tone="danger" title="Dashboard unavailable" description={loadError} />
      </View>
    );
  }
  return <View className="flex-1 bg-background">
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerClassName={"grow"}>
        <View className={"flex-1 gap-[24px] px-[20px] py-[24px]"}>
          {/* Header */}
          <View className={"gap-[16px]"}>
            <PageHeader
              title={firstVisit && username ? `Welcome, ${username}` : username ? `Welcome back, ${username}` : "Welcome back"}
              description="A clear view of your plan, resources, and local earthquake information."
            />
            <View className={"w-[100%] gap-[12px] rounded-[18px] border border-border bg-card p-[20px] shadow-sm"}>
              <View className={"flex-row justify-between items-center mb-[12px]"}>
                <Text className={"text-base font-bold text-secondary-foreground"}>
                  Preparedness progress
                </Text>
                <Text className={"text-lg font-extrabold text-primary"} style={{ fontVariant: ["tabular-nums"] }}>
                  {Math.round(overallProgress * 100)}%
                </Text>
              </View>
              <Progress value={overallProgress} className="h-2" />
              <Text className={"text-[14px] text-muted-foreground leading-[20px]"}>
                {getProgressMessage(overallProgress)}
              </Text>
            </View>
          </View>

          {/* Quick action cards */}
          <View className={"gap-[12px]"}>
            <SectionHeader title="Quick actions" description="Continue where you left off." />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName={["gap-[8px]", "bg-[transparent]"].filter(Boolean).join(" ")} contentContainerStyle={{
            paddingHorizontal: HORIZONTAL_PADDING
          }} onScroll={handleScroll} scrollEventThrottle={16} decelerationRate="fast" snapToInterval={SNAP_INTERVAL} snapToAlignment="start" bounces={false} overScrollMode="never">
              {cards.map((item, idx) => <View key={item.title} className={["bg-card rounded-[16px] p-[20px] shadow-sm min-h-[220px] border border-border"].filter(Boolean).join(" ")} style={{
              width: CARD_WIDTH,
              marginRight: idx === cards.length - 1 ? 0 : CARD_GAP,
              borderCurve: "continuous"
            }}>
                  {item.iconImage ? <Image source={item.iconImage} className={["mb-[12px] self-center", "w-[46px] h-[46px]"].filter(Boolean).join(" ")} /> : <AppIcon name={item.icon} size={40} color={palette.primary} className={"mb-[12px] self-center"} />}
                  <Text className={"text-[18px] text-secondary-foreground font-bold text-center mb-[8px] leading-[22px]"}>{item.title}</Text>
                  <Text className={"text-[14px] text-muted-foreground text-center mb-[20px] leading-[20px] flex-1"}>{item.text}</Text>
                  <Button unstyled onPress={item.onPress} className={"bg-primary rounded-[12px] py-[14px] items-center"}>
                    <Text className={"text-primary-foreground text-[16px] font-bold"}>
                      {item.button}
                    </Text>
                  </Button>
                </View>)}
            </ScrollView>
            <View className={"flex-row justify-center items-center gap-[8px] mt-[12px] px-[20px]"}>
              {cards.map((_, index) => <Button unstyled key={index}>
                  <View className={["w-[8px] h-[8px] rounded-[4px] bg-muted-foreground/40", index === activeDot && "bg-primary w-[24px] h-[8px]"].filter(Boolean).join(" ")} />
                </Button>)}
            </View>
          </View>

          {/* Your Feed */}
          <View className={"gap-[12px]"}>
            <SectionHeader title="Local updates" description="Risk and news for informed decisions." />
            <View className={"w-[100%] overflow-hidden rounded-[16px] border border-border bg-card shadow-sm"}>
              {feedItems.map((item, index) => (
                <ListRow
                  key={item.text}
                  icon={APP_ICONS[item.icon]}
                  title={item.text}
                  subtitle={item.text === "Local Risk" ? "Recent activity and your area risk" : "Current earthquake reporting"}
                  onPress={item.onPress}
                  className={index > 0 ? "border-t border-border" : undefined}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>;
}
