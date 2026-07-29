import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Animated, AppState, Dimensions, Image, ScrollView, Text, View } from "react-native";
import { getData } from "../../lib/storage/storageUtils";
import { getPrepareModules } from "../../lib/prepareModules";
import { useTheme } from "../../lib/theme";
export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [firstVisit, setFirstVisit] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const [, setModules] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const navigation = useNavigation();
  const { palette } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const {
    width: screenWidth
  } = Dimensions.get("window");
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
        const ms = await getPrepareModules();
        if (!mounted) return;
        setModules(ms || []);
        if (ms && ms.length) {
          const avg = ms.reduce((acc, m) => acc + (Number(m.progress) || 0), 0) / ms.length;
          setOverallProgress(avg);
        } else setOverallProgress(0);
      } catch (e) {
        console.warn("Dashboard: failed to load modules", e);
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
  const CARD_WIDTH = 280;
  const CARD_GAP = 8;
  const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
  const HORIZONTAL_PADDING = Math.max(0, Math.round((screenWidth - CARD_WIDTH) / 2));
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
  return <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName={"grow"}>
        <View className={"flex-1 p-[16px] pt-[28px] pb-[28px]"}>
          {/* Header */}
          <View className={"items-center mb-[22px]"}>
            <Text className={"text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"}>
              {firstVisit && username ? `Welcome to Aftershock, ${username}!` : username ? `Welcome back, ${username}!` : "Welcome back!"}
            </Text>
            <View className={["rounded-[18px] p-[18px] mt-[10px] mb-[4px] shadow-sm border border-border w-[100%]", "bg-card"].filter(Boolean).join(" ")}>
              <View className={"flex-row justify-between items-center mb-[12px]"}>
                <Text className={"text-base font-semibold text-secondary-foreground"}>
                  Prepare Progress
                </Text>
                <Text className={"text-base font-bold text-primary"}>
                  {Math.round(overallProgress * 100)}%
                </Text>
              </View>
              <Progress value={overallProgress} className="h-2" />
              <Text className={"text-[14px] text-muted-foreground text-center mt-[12px] leading-[18px]"}>
                {getProgressMessage(overallProgress)}
              </Text>
            </View>
          </View>

          {/* Quick action cards */}
          <View className={"mb-[16px]"}>
            <Text className={"text-[19px] font-bold text-secondary-foreground mb-[12px]"}>Quick Actions</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName={["gap-[8px]", "bg-[transparent]"].filter(Boolean).join(" ")} contentContainerStyle={{
            paddingHorizontal: HORIZONTAL_PADDING
          }} onScroll={handleScroll} scrollEventThrottle={16} decelerationRate="fast" snapToInterval={SNAP_INTERVAL} snapToAlignment="start" bounces={false} overScrollMode="never">
              {cards.map((item, idx) => <View key={item.title} className={["bg-card rounded-[16px] p-[18px] w-[280px] shadow-sm min-h-[210px] border border-border"].filter(Boolean).join(" ")} style={{
              marginRight: idx === cards.length - 1 ? 0 : CARD_GAP
            }}>
                  {item.iconImage ? <Image source={item.iconImage} className={["mb-[12px] self-center", "w-[46px] h-[46px]"].filter(Boolean).join(" ")} /> : <MaterialCommunityIcons name={item.icon} size={44} color={palette.primary} className={"mb-[12px] self-center"} />}
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
          <View className={"mb-[24px]"}>
            <Text className={"text-[19px] font-bold text-secondary-foreground mb-[12px]"}>Your Feed</Text>
            <View className={"flex-col w-[100%]"}>
              {feedItems.map((item, index) => <View key={item.text} className={"flex-row items-center bg-card p-[16px] rounded-[16px] w-[100%] mb-[12px] shadow-sm border border-border"}>
                  <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                  <Button unstyled className={"text-[14px] text-secondary-foreground font-semibold ml-[8px] flex-1"} onPress={item.onPress}>
                    <Text>{item.text}</Text>
                  </Button>
                </View>)}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>;
}
