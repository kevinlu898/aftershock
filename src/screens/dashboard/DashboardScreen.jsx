import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Image, RefreshControl, ScrollView, View } from "react-native";
import { APP_ICONS, AppIcon } from "../../components/app-icon";
import {
  ErrorState,
  ListRow,
  PageHeader,
  Screen,
  SectionHeader,
} from "../../components/app-ui";
import { SetupNudgeCard } from "../../components/dashboard/SetupNudgeCard";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { Text } from "../../components/ui/text";
import { useRefresh } from "../../hooks/useRefresh";
import { getPrepareModules } from "../../lib/prepareModules";
import { getData } from "../../lib/storage/storageUtils";
import { useTheme } from "../../lib/theme";

const getProgressMessage = (progress) => {
  if (progress === 0) return "Let's get started on your earthquake plan!";
  if (progress < 0.25) return "Great start! Keep building your safety plan.";
  if (progress < 0.5) return "You're making progress! Continue preparing.";
  if (progress < 0.75) return "Well done! You're becoming more prepared.";
  if (progress < 1) return "Almost there! Just a few steps to complete safety.";
  return "Excellent! You're fully prepared for earthquakes!";
};

function QuickActionCard({ item }) {
  const { palette } = useTheme();

  return (
    <View className="w-1/2 p-1.5">
      <Button
        unstyled
        onPress={item.onPress}
        className="min-h-[148px] w-full rounded-2xl border border-border bg-card p-4 shadow-card active:opacity-80"
        style={{ borderCurve: "continuous" }}
        accessibilityLabel={item.title}
      >
        <View className="w-full flex-1 items-center">
          {item.iconImage ? (
            <Image
              source={item.iconImage}
              className="mb-3 h-10 w-10"
              accessibilityLabel=""
            />
          ) : (
            <AppIcon
              name={item.icon}
              size={34}
              color={palette.primary}
              className="mb-3"
            />
          )}
          <Text className="mb-3 flex-1 text-center text-body-lg font-bold text-secondary-foreground">
            {item.title}
          </Text>
          <View className="w-full rounded-xl bg-primary py-2.5">
            <Text className="text-center text-body-sm font-bold text-primary-foreground">
              {item.button}
            </Text>
          </View>
        </View>
      </Button>
    </View>
  );
}

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [firstVisit, setFirstVisit] = useState(false);
  const [modules, setModules] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const navigation = useNavigation();
  const { palette } = useTheme();
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    let isMounted = true;
    getData("firstname").then((value) => {
      if (isMounted && value) setUsername(value);
    });
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

  const loadModules = useCallback(async () => {
    try {
      setLoadError(null);
      const list = await getPrepareModules();
      const safe = Array.isArray(list) ? list : [];
      setModules(safe);
      setOverallProgress(
        safe.length
          ? safe.reduce((acc, m) => acc + (Number(m.progress) || 0), 0) /
              safe.length
          : 0
      );
      try {
        await AsyncStorage.setItem("prepare_modules_cache", JSON.stringify(safe));
      } catch {
      }
    } catch (error) {
      console.warn("Dashboard: failed to load modules", error);
      setLoadError("Preparedness progress could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModules();
    const unsubscribe = navigation.addListener?.("focus", loadModules);
    return () => unsubscribe?.();
  }, [navigation, loadModules]);

  useEffect(() => {
    const handleAppState = (nextState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        loadModules();
      }
      appStateRef.current = nextState;
    };
    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [loadModules]);

  const { refreshing, onRefresh } = useRefresh(loadModules);

  const cards = [
    {
      title: "Review Plan",
      icon: "account-check",
      button: "Review",
      onPress: () => navigation.navigate("MyPlan"),
    },
    {
      title: "Epicenter AI",
      iconImage: require("../../../assets/images/filledEpicenter.png"),
      button: "New Chat",
      onPress: () => navigation.navigate("EpicenterAI"),
    },
  ];

  const feedItems = [
    {
      icon: "map-marker-radius",
      title: "Local Risk",
      onPress: () => navigation.navigate("LocalRisk"),
    },
    {
      icon: "newspaper",
      title: "Earthquake News",
      onPress: () => navigation.navigate("News"),
    },
  ];

  if (loading) {
    return showSkeleton ? (
      <ScreenSkeleton cards={4} />
    ) : (
      <View className="flex-1 bg-background" />
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description={loadError}
        onRetry={loadModules}
      />
    );
  }

  const nextModule =
    modules.find((m) => (Number(m.progress) || 0) < 1) || null;
  const nextLesson =
    nextModule?.lessons?.find((lesson) => !lesson.completed) ||
    nextModule?.lessons?.[0] ||
    null;

  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      >
        <View className="flex-1 gap-6 px-5 py-6">
          <View className="gap-4">
            <PageHeader
              title={
                firstVisit && username
                  ? `Welcome, ${username}`
                  : username
                    ? `Welcome back, ${username}`
                    : "Welcome back"
              }
            />

            <View className="w-full gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-body-lg font-bold text-secondary-foreground">
                  Preparedness progress
                </Text>
                <Text
                  className="text-title-sm font-extrabold text-primary"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {Math.round(overallProgress * 100)}%
                </Text>
              </View>
              <Progress value={overallProgress} className="h-2" />
              <Text className="text-body-sm text-muted-foreground">
                {getProgressMessage(overallProgress)}
              </Text>

              {nextModule ? (
                <Button
                  unstyled
                  onPress={() => navigation.navigate("Prepare")}
                  className="mt-1 min-h-14 flex-row items-center gap-3 rounded-xl bg-secondary px-4 py-3 active:opacity-80"
                  style={{ borderCurve: "continuous" }}
                  accessibilityLabel={`Next up: ${nextLesson?.title || nextModule.title}. Open Prepare.`}
                  accessibilityHint="Opens your learning path"
                >
                  <AppIcon
                    name={nextModule.icon || "clipboard-list"}
                    size={20}
                    color={palette.primary}
                  />
                  <View className="min-w-0 flex-1">
                    <Text className="text-caption font-semibold uppercase text-muted-foreground">
                      Next up
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-body-sm font-bold text-primary"
                    >
                      {nextLesson?.title || nextModule.title}
                    </Text>
                  </View>
                  <AppIcon
                    name="chevron-right"
                    size={18}
                    color={palette.mutedForeground}
                  />
                </Button>
              ) : null}
            </View>
          </View>

          <SetupNudgeCard />

          <View className="gap-2">
            <View className="-m-1.5 flex-row flex-wrap">
              {cards.map((item) => (
                <QuickActionCard key={item.title} item={item} />
              ))}
            </View>
          </View>

          <View className="gap-3">
            <SectionHeader title="Local updates" />
            <View className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              {feedItems.map((item, index) => (
                <ListRow
                  key={item.title}
                  icon={APP_ICONS[item.icon]}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={item.onPress}
                  className={index > 0 ? "border-t border-border" : undefined}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
