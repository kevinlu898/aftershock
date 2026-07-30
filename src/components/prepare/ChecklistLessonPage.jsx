import { Button } from "../ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppIcon } from "../app-icon";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "../../lib/theme";
export default function ChecklistLessonPage({
  content,
  lessonId,
  moduleId,
  onContinue,
  pageId
}) {
  const { palette } = useTheme();
  const initialItems = useMemo(() => Array.isArray(content) ? content : [], [content]);
  const [checklist, setChecklist] = useState(initialItems);
  const allCompleted = checklist.length > 0 && checklist.every(item => item.completed);
  const storageKey = moduleId && lessonId && pageId ? `prepare_checklist:${moduleId}:${lessonId}:${pageId}` : null;
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!storageKey) return;
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!active) return;
        if (!raw) {
          setChecklist(initialItems);
          return;
        }
        const storedItems = JSON.parse(raw);
        if (!Array.isArray(storedItems)) return;
        setChecklist(initialItems.map(item => {
          const storedItem = storedItems.find(candidate => candidate.id === item.id);
          return storedItem ? {
            ...item,
            completed: Boolean(storedItem.completed)
          } : {
            ...item
          };
        }));
      } catch (_error) {
        setChecklist(initialItems);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [initialItems, storageKey]);
  useEffect(() => {
    if (!storageKey) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(checklist)).catch(() => {});
  }, [checklist, storageKey]);
  const toggleItem = itemId => {
    setChecklist(items => items.map(item => item.id === itemId ? {
      ...item,
      completed: !item.completed
    } : item));
  };
  const completedCount = checklist.filter(item => item.completed).length;
  return <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-5 pb-8 pt-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[720px] self-center">
          <View className="mb-5 flex-row items-start gap-3">
            <View className="h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary" style={{ borderCurve: "continuous" }}>
              <AppIcon name="list-checks" size={21} color={palette.primary} />
            </View>
            <View className="min-w-0 flex-1 gap-1.5">
              <Text className="text-[26px] font-extrabold leading-[32px] text-foreground">Action checklist</Text>
              <Text className="text-[15px] leading-[22px] text-muted-foreground">
                Mark each item as you complete it. Your progress is saved automatically.
              </Text>
            </View>
          </View>

          <View
            className="rounded-[20px] border border-border bg-card p-5"
            style={{
              borderCurve: "continuous",
              boxShadow: "0 2px 12px rgba(23, 32, 28, 0.05)"
            }}
          >
            <View className="mb-5 flex-row items-center justify-between gap-4">
              <Text className="text-[15px] font-bold text-foreground">Tasks</Text>
              <Text
                className="text-[13px] font-semibold text-muted-foreground"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {completedCount} of {checklist.length}
              </Text>
            </View>

            <View className="gap-3">
              {checklist.map(item => <Button
                unstyled
                key={item.id}
                className={[
                  "min-h-[64px] flex-row items-center gap-3 rounded-[15px] border border-border bg-background p-3.5 active:bg-muted",
                  item.completed && "border-primary bg-secondary"
                ].filter(Boolean).join(" ")}
                style={{ borderCurve: "continuous" }}
                onPress={() => toggleItem(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.completed }}
              >
                  <View className={[
                    "h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-muted-foreground bg-card",
                    item.completed && "border-primary bg-primary"
                  ].filter(Boolean).join(" ")}>
                    {item.completed ? <AppIcon name="check" size={17} color={palette.primaryForeground} /> : null}
                  </View>
                  <Text className={[
                    "min-w-0 flex-1 text-[15px] leading-[21px] text-foreground",
                    item.completed && "text-muted-foreground line-through"
                  ].filter(Boolean).join(" ")}>
                    {item.text}
                  </Text>
              </Button>)}
            </View>

            {allCompleted ? <View className="mt-5 flex-row items-center gap-2 rounded-[14px] bg-secondary p-3.5">
              <AppIcon name="check-circle" size={20} color={palette.primary} />
              <Text className="flex-1 text-[14px] font-semibold text-primary">
                Everything is checked off. You are ready to continue.
              </Text>
            </View> : null}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-border bg-background px-5 pb-3 pt-3">
        <Button
          className="min-h-[52px] w-full max-w-[720px] self-center rounded-[14px]"
          onPress={onContinue}
          disabled={!allCompleted}
        >
          <Text className="text-base font-bold text-primary-foreground">
            {allCompleted ? "Continue" : `${checklist.length - completedCount} tasks remaining`}
          </Text>
          {allCompleted ? <AppIcon name="chevron-right" size={20} color={palette.primaryForeground} /> : null}
        </Button>
      </View>
    </View>;
}
