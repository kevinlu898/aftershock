import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Text } from "../../components/ui/text";
import { ErrorState, PageHeader } from "../../components/app-ui";
import { AppIcon } from "../../components/app-icon";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  ScreenSkeleton,
  useDelayedSkeleton } from "../../components/ui/skeleton";
import {
  findFirstIncompletePageIndex,
  getLessonCurrentPageIndex,
  getPrepareModules } from "../../lib/prepareModules";
import { events } from "../../lib/prepareCompletion";
import { useRefresh } from "../../hooks/useRefresh";
import { useTheme } from "../../lib/theme";

const getModuleAction = (progress) => {
  if (progress === 0) return "Start module";
  if (progress === 1) return "Review module";
  if (progress >= 0.9) return "Finish module";
  return "Continue module";
};

const getNextLesson = (module) =>
  (module.lessons || []).find((lesson) => !lesson.completed) ||
  module.lessons?.[0];

function ModuleCard({ module, expanded, onToggle, onOpenLesson }) {
  const { palette } = useTheme();
  const completedLessons = module.lessons.filter(
    (lesson) => lesson.completed
  ).length;
  const percent = Math.round(module.progress * 100);
  const activeColor =
    module.progress > 0 ? palette.primary : palette.mutedForeground;

  return (
    <View
      className="overflow-hidden rounded-[20px] border border-border bg-card shadow-card"
      style={{ borderCurve: "continuous" }}
    >
      <Button
        unstyled
        className="min-h-[104px] flex-row items-center gap-4 px-[18px] py-4 active:bg-muted"
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${activeColor}18`,
            borderCurve: "continuous" }}
        >
          <AppIcon name={module.icon} size={23} color={activeColor} />
        </View>

        <View className="min-w-0 flex-1 gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="text-callout font-bold text-foreground">
                {module.title}
              </Text>
              <Text
                className="text-footnote text-muted-foreground"
                numberOfLines={1}
              >
                {module.description}
              </Text>
            </View>
            <AppIcon
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={palette.mutedForeground}
            />
          </View>

          <View className="flex-row items-center gap-3">
            <Progress value={module.progress} className="h-1.5 flex-1" />
            <Text
              className="text-xs font-semibold text-muted-foreground"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {percent}%
            </Text>
          </View>
        </View>
      </Button>

      {expanded ? (
        <View className="border-t border-border px-[18px] pb-[18px] pt-2">
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-footnote font-semibold text-muted-foreground">
              {completedLessons} of {module.lessons.length} lessons complete
            </Text>
            {module.progress === 1 ? (
              <View className="flex-row items-center gap-1.5">
                <AppIcon
                  name="check-circle"
                  size={16}
                  color={palette.primary}
                />
                <Text className="text-footnote font-semibold text-primary">
                  Complete
                </Text>
              </View>
            ) : null}
          </View>

          <View className="overflow-hidden rounded-2xl bg-card">
            {module.lessons.map((lesson, index) => (
              <Button
                unstyled
                key={lesson.id}
                className={[
                  "min-h-[64px] flex-row items-center gap-3 rounded-none bg-card px-3.5 py-3 active:bg-secondary",
                  index < module.lessons.length - 1 &&
                    "border-b border-border",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onPress={() => onOpenLesson(lesson)}
              >
                <View
                  className={[
                    "h-8 w-8 items-center justify-center rounded-full bg-muted",
                    lesson.completed && "bg-secondary",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <AppIcon
                    name={lesson.completed ? "check" : "book-open"}
                    size={16}
                    color={
                      lesson.completed
                        ? palette.primary
                        : palette.mutedForeground
                    }
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text
                    className={[
                      "text-body font-semibold leading-5 text-foreground",
                      lesson.completed && "text-muted-foreground",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    numberOfLines={2}
                  >
                    {lesson.title}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {lesson.duration}
                  </Text>
                </View>
                <AppIcon
                  name="chevron-right"
                  size={18}
                  color={palette.mutedForeground}
                />
              </Button>
            ))}
          </View>

          <Button
            className="mt-4 min-h-12 rounded-xl"
            onPress={() => onOpenLesson(getNextLesson(module))}
          >
            <Text className="text-base font-bold text-primary-foreground">
              {getModuleAction(module.progress)}
            </Text>
            <AppIcon
              name="chevron-right"
              size={19}
              color={palette.primaryForeground}
            />
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export default function PrepareScreen() {
  const [expandedModule, setExpandedModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const navigation = useNavigation();
  const { palette } = useTheme();

  const fetchModules = useCallback(async () => {
    try {
      setLoadError(null);
      const nextModules = (await getPrepareModules()) || [];
      setModules(nextModules);
    } catch (error) {
      console.warn("Prepare: fetchModules error", error);
      setLoadError("Your learning path could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  const { refreshing, onRefresh } = useRefresh(fetchModules);

  useEffect(() => {
    fetchModules();
    const focusOff =
      navigation.addListener && navigation.addListener("focus", fetchModules);
    const eventOff = events.on("changed", fetchModules);
    return () => {
      focusOff && focusOff();
      eventOff && eventOff();
    };
  }, [navigation, fetchModules]);

  const lessonCount = useMemo(
    () => modules.reduce((total, module) => total + module.lessons.length, 0),
    [modules]
  );
  const completedLessonCount = useMemo(
    () =>
      modules.reduce(
        (total, module) =>
          total +
          module.lessons.filter((lesson) => lesson.completed).length,
        0
      ),
    [modules]
  );
  const overallProgress =
    modules.length > 0
      ? modules.reduce(
          (total, module) => total + (Number(module.progress) || 0),
          0
        ) / modules.length
      : 0;
  const nextModule =
    modules.find((module) => module.progress < 1) || modules[0];
  const nextLesson = nextModule ? getNextLesson(nextModule) : null;

  const openLesson = async (module, lesson) => {
    if (!module || !lesson) return;
    const saved = await getLessonCurrentPageIndex(lesson.id);
    const pageIndex = saved ?? findFirstIncompletePageIndex(lesson);
    navigation.navigate("PrepareLesson", {
      lessonId: lesson.id,
      moduleId: module.id,
      lessonData: lesson,
      initialPageIndex: pageIndex });
  };

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
        title="Prepare is unavailable"
        description={loadError}
        onRetry={fetchModules}
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-7 px-5 pb-10 pt-6"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={palette.primary}
          colors={[palette.primary]}
        />
      }
    >
      <PageHeader title="Prepare" />

      <View
        className="overflow-hidden rounded-[24px] bg-primary p-5 shadow-overlay"
        style={{ borderCurve: "continuous" }}
      >
        <View className="flex-row items-start justify-between gap-5">
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-sm font-semibold text-primary-foreground opacity-80">
              Your readiness
            </Text>
            <Text
              className="text-display-xl font-extrabold text-primary-foreground"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {Math.round(overallProgress * 100)}%
            </Text>
            <Text className="text-sm leading-5 text-primary-foreground opacity-80">
              {completedLessonCount} of {lessonCount} lessons complete
            </Text>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-white/15">
            <AppIcon
              name={overallProgress === 1 ? "trophy" : "shield"}
              size={28}
              color={palette.primaryForeground}
            />
          </View>
        </View>

        <View className="mt-5 h-2 overflow-hidden rounded-full bg-black/15">
          <View
            className="h-full rounded-full bg-primary-foreground"
            style={{ width: `${overallProgress * 100}%` }}
          />
        </View>

        {nextModule && nextLesson ? (
          <Button
            unstyled
            className="mt-5 min-h-[62px] flex-row items-center gap-3 rounded-2xl bg-card px-4 py-3 active:opacity-90"
            onPress={() => openLesson(nextModule, nextLesson)}
          >
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-secondary">
              <AppIcon
                name={overallProgress === 1 ? "replay" : "play"}
                size={18}
                color={palette.primary}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-xs font-semibold text-muted-foreground">
                {overallProgress === 1 ? "Review a lesson" : "Up next"}
              </Text>
              <Text
                className="text-body font-bold text-foreground"
                numberOfLines={1}
              >
                {nextLesson.title}
              </Text>
            </View>
            <AppIcon
              name="chevron-right"
              size={19}
              color={palette.primary}
            />
          </Button>
        ) : null}
      </View>

      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-xl font-bold leading-6 text-foreground">
            Get started
          </Text>
        </View>

        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            expanded={expandedModule === module.id}
            onToggle={() =>
              setExpandedModule((current) =>
                current === module.id ? null : module.id
              )
            }
            onOpenLesson={(lesson) => openLesson(module, lesson)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
