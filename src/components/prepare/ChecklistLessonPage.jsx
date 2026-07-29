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
  return <View className={"flex-1 py-[12px] px-[12px]"}>
      <ScrollView className="flex-1" contentContainerClassName="pb-2">
        <View className={"bg-card rounded-[18px] p-[20px] mb-[12px] shadow-sm border border-border max-w-[900px] self-center"}>
          <Text className={"text-base text-secondary-foreground mb-[16px] text-left font-semibold"}>
            Complete the following tasks:
          </Text>
          <View className={"mb-[16px] bg-muted rounded-[8px] p-[4px]"}>
            {checklist.map(item => <Button unstyled key={item.id} className={["flex-row items-center py-[14px] px-[12px] bg-card rounded-[6px] mb-[4px] border border-border", item.completed && "bg-secondary border-primary"].filter(Boolean).join(" ")} onPress={() => toggleItem(item.id)}>
                <View className={"flex-row items-center flex-1"}>
                  <View className={["w-[22px] h-[22px] rounded-[4px] border-[2px] border-muted-foreground justify-center items-center mr-[14px] bg-card", item.completed && "bg-primary border-primary"].filter(Boolean).join(" ")}>
                    {item.completed && <AppIcon name="check" size={16} color={palette.primaryForeground} />}
                  </View>
                  <Text className={["text-[15px] text-secondary-foreground flex-1 leading-[20px]", item.completed && "text-muted-foreground line-through"].filter(Boolean).join(" ")}>
                    {item.text}
                  </Text>
                </View>
              </Button>)}
          </View>
          {allCompleted && <View className={"flex-row items-center justify-center bg-secondary p-[12px] rounded-[8px] gap-[8px] border border-primary"}>
              <AppIcon name="check-circle" size={20} color={palette.primary} />
              <Text className={"text-base text-primary font-semibold"}>
                All items completed!
              </Text>
            </View>}
        </View>
      </ScrollView>
      <Button unstyled className={["flex-row items-center justify-center bg-primary px-[24px] py-[14px] rounded-[8px] gap-[8px]", !allCompleted && "bg-muted"].filter(Boolean).join(" ")} onPress={onContinue} disabled={!allCompleted}>
        <Text className={"text-primary-foreground text-base font-bold"}>
          {allCompleted ? "Continue" : "Complete All Items to Continue"}
        </Text>
        {allCompleted && <AppIcon name="chevron-right" size={20} color={palette.primaryForeground} />}
      </Button>
    </View>;
}
