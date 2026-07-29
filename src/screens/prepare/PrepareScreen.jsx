import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { findFirstIncompletePageIndex, getLessonCurrentPageIndex, getPrepareModules } from '../../lib/prepareModules';
import { events } from '../../lib/prepareCompletion';
import { useTheme } from '../../lib/theme';
const Prepare = () => {
  const [expandedModule, setExpandedModule] = useState(null);
  const [modules, setModules] = useState([]);
  const navigation = useNavigation();
  const { palette } = useTheme();
  const toggleModule = moduleId => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };
  const fetchModules = async () => {
    try {
      const ms = await getPrepareModules();
      setModules(ms || []);
    } catch (e) {
      console.warn('Prepare: fetchModules error', e);
    }
  };
  useEffect(() => {
    fetchModules();
    const focusOff = navigation.addListener && navigation.addListener('focus', fetchModules);
    const off = events.on('changed', () => fetchModules());
    return () => {
      focusOff && focusOff();
      off && off();
    };
  }, [navigation]);
  const ModuleCard = ({
    module
  }) => {
    const isExpanded = expandedModule === module.id;
    const statusColor = module.progress > 0 ? palette.primary : palette.mutedForeground;
    return <View className={"bg-card rounded-[16px] shadow-sm border border-border overflow-hidden"}>
        <Button unstyled className={"flex-row items-center justify-between p-[18px]"} onPress={() => toggleModule(module.id)} activeOpacity={0.7}>
          <View className={"flex-row items-center flex-1"}>
            <View className={["w-[40px] h-[40px] rounded-[20px] justify-center items-center mr-[12px]"].filter(Boolean).join(" ")} style={{
            backgroundColor: `${statusColor}20`
          }}>
              <MaterialCommunityIcons name={module.icon} size={24} color={statusColor} />
            </View>
            <View className={"flex-1"}>
              <Text className={"text-base font-semibold text-secondary-foreground mb-[2px]"}>{module.title}</Text>
              <Text className={"text-base text-muted-foreground mb-[8px]"}>{module.description}</Text>
              <Progress value={module.progress} className="h-2" />
            </View>
          </View>
          <View className={"items-end gap-[4px]"}>
            <Text className={["text-base font-semibold"].filter(Boolean).join(" ")} style={{
            color: statusColor
          }}>
              {Math.round(module.progress * 100)}%
            </Text>
            <MaterialCommunityIcons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={palette.foreground} />
          </View>
        </Button>

        {isExpanded && <View className={"border-t border-border p-[18px]"}>
            {module.lessons.map((lesson, index) => <Button unstyled key={lesson.id} className={["flex-row items-center justify-between py-[12px] border-b border-border", index === module.lessons.length - 1 && "border-b-[0px]"].filter(Boolean).join(" ")} activeOpacity={0.6} onPress={async () => {
          const saved = await getLessonCurrentPageIndex(lesson.id);
          const pageIndex = saved ?? findFirstIncompletePageIndex(lesson);
          navigation.navigate('prepareLessons', {
            lessonId: lesson.id,
            moduleId: module.id,
            lessonData: lesson,
            initialPageIndex: pageIndex
          });
        }}>
                <View className={"flex-row items-center flex-1"}>
                  <MaterialCommunityIcons name={lesson.completed ? 'check-circle' : 'circle-outline'} size={20} color={lesson.completed ? palette.primary : palette.foreground} />
                  <Text className={["text-base text-secondary-foreground ml-[12px] flex-1", lesson.completed && "line-through text-muted-foreground"].filter(Boolean).join(" ")}>
                    {lesson.title}
                  </Text>
                </View>
                <View className={"flex-row items-center"}>
                  <Text className={"text-base text-muted-foreground mr-[8px]"}>{lesson.duration}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={palette.foreground} />
                </View>
              </Button>)}

            <View className={"flex-row gap-[12px] mt-[16px]"}>
              {module.progress === 0 ? <Button unstyled className={"bg-primary px-[20px] py-[12px] rounded-[12px] flex-1"} onPress={async () => {
            const first = module.lessons && module.lessons[0];
            if (first) {
              const saved = await getLessonCurrentPageIndex(first.id);
              const pageIndex = saved ?? findFirstIncompletePageIndex(first);
              navigation.navigate('prepareLessons', {
                lessonId: first.id,
                moduleId: module.id,
                lessonData: first,
                initialPageIndex: pageIndex
              });
            }
          }}>
                  <Text className={"text-primary-foreground text-base font-semibold text-center"}>Start</Text>
                </Button> : module.progress >= 0.9 && module.progress < 1 ? <Button unstyled className={"bg-primary px-[20px] py-[12px] rounded-[12px] flex-1"} onPress={async () => {
            const next = (module.lessons || []).find(l => !l.completed) || module.lessons && module.lessons[0];
            if (next) {
              const saved = await getLessonCurrentPageIndex(next.id);
              const pageIndex = saved ?? findFirstIncompletePageIndex(next);
              navigation.navigate('prepareLessons', {
                lessonId: next.id,
                moduleId: module.id,
                lessonData: next,
                initialPageIndex: pageIndex
              });
            }
          }}>
                  <Text className={"text-primary-foreground text-base font-semibold text-center"}>Finish</Text>
                </Button> : module.progress === 1 ? <Button unstyled className={"border border-primary px-[20px] py-[10px] rounded-[8px] flex-1"} onPress={async () => {
            const first = module.lessons && module.lessons[0];
            if (first) {
              const saved = await getLessonCurrentPageIndex(first.id);
              const pageIndex = saved ?? findFirstIncompletePageIndex(first);
              navigation.navigate('prepareLessons', {
                lessonId: first.id,
                moduleId: module.id,
                lessonData: first,
                initialPageIndex: pageIndex
              });
            }
          }}>
                  <Text className={"text-primary text-base font-semibold text-center"}>Review</Text>
                </Button> : <Button unstyled className={"bg-primary px-[20px] py-[12px] rounded-[12px] flex-1"} onPress={async () => {
            const next = (module.lessons || []).find(l => !l.completed) || module.lessons && module.lessons[0];
            if (next) {
              const saved = await getLessonCurrentPageIndex(next.id);
              const pageIndex = saved ?? findFirstIncompletePageIndex(next);
              navigation.navigate('prepareLessons', {
                lessonId: next.id,
                moduleId: module.id,
                lessonData: next,
                initialPageIndex: pageIndex
              });
            }
          }}>
                  <Text className={"text-primary-foreground text-base font-semibold text-center"}>Continue</Text>
                </Button>}
            </View>
          </View>}
      </View>;
  };
  const overallProgress = modules.length > 0 ? modules.reduce((acc, module) => acc + (Number(module.progress) || 0), 0) / modules.length : 0;
  return <View className="flex-1 bg-background">
      

      <ScrollView className="flex-1 bg-background" contentContainerClassName="px-[16px] pt-[30px] pb-[30px]" showsVerticalScrollIndicator={false}>
        <Text className={"text-[30px] font-extrabold text-primary text-center mb-[8px] mt-0"}>Prepare</Text>
        <Text className={"text-base text-muted-foreground text-center mb-[24px] leading-[22px]"}>Complete your journey to earthquake safety</Text>

        <View className={["bg-card rounded-[18px] p-[18px] mb-[20px] shadow-sm border border-border", "bg-card"].filter(Boolean).join(" ")}>
          <View className={"flex-row justify-between items-center mb-[12px]"}>
            <Text className={"text-base font-semibold text-secondary-foreground"}>Overall Progress</Text>
            <Text className={"text-base font-bold text-primary"}>{Math.round(overallProgress * 100)}%</Text>
          </View>
          <Progress value={overallProgress} className="h-2" />
        </View>

        <View className={"gap-[12px]"}>
          {modules.map(module => <ModuleCard key={module.id} module={module} />)}
        </View>
      </ScrollView>
    </View>;
};
export default Prepare;
