import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, globalStyles } from '../../css';
import { findFirstIncompletePageIndex, getLessonCurrentPageIndex, getPrepareModules } from './prepareModules';
import completion from './prepareModulesCompletion';
import prepareStyles from './prepareStyles';

const Prepare = () => {
  const [expandedModule, setExpandedModule] = useState(null);
  const [modules, setModules] = useState([]);
  const navigation = useNavigation();

  const toggleModule = (moduleId) => {
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
    const off = completion.events.on('changed', () => fetchModules());
    return () => {
      focusOff && focusOff();
      off && off();
    };
  }, []);

  const ProgressBar = ({ progress }) => (
    <View style={prepareStyles.progressContainer}>
      <View style={[prepareStyles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
  );

  const ModuleCard = ({ module }) => {
    const isExpanded = expandedModule === module.id;
    const statusColor = module.progress > 0 ? '#10B981' : '#9CA3AF';

    return (
      <View style={prepareStyles.card}>
        <TouchableOpacity 
          style={prepareStyles.cardHeader}
          onPress={() => toggleModule(module.id)}
          activeOpacity={0.7}
        >
          <View style={prepareStyles.headerLeft}>
            <View style={[prepareStyles.iconContainer, { backgroundColor: `${statusColor}20` }]}>
              <MaterialCommunityIcons name={module.icon} size={24} color={statusColor} />
            </View>
            <View style={prepareStyles.headerText}>
              <Text style={prepareStyles.moduleTitle}>{module.title}</Text>
              <Text style={prepareStyles.moduleDescription}>{module.description}</Text>
              <ProgressBar progress={module.progress} />
            </View>
          </View>
          <View style={prepareStyles.headerRight}>
            <Text style={[prepareStyles.progressText, { color: statusColor }]}>
              {Math.round(module.progress * 100)}%
            </Text>
            <MaterialCommunityIcons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={colors.secondary} 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={prepareStyles.lessonsContainer}>
            {module.lessons.map((lesson, index) => (
              <TouchableOpacity 
                key={lesson.id}
                style={[
                  prepareStyles.lessonItem,
                  index === module.lessons.length - 1 && prepareStyles.lastLessonItem
                ]}
                activeOpacity={0.6}
                onPress={async () => {
                  console.log('Prepare: lesson tap', module.id, lesson.id);
                  const saved = await getLessonCurrentPageIndex(lesson.id);
                  const pageIndex = saved ?? findFirstIncompletePageIndex(lesson);
                  navigation.navigate('prepareLessons', { lessonId: lesson.id, moduleId: module.id, lessonData: lesson, initialPageIndex: pageIndex });
                }}
              >
                <View style={prepareStyles.lessonLeft}>
                  <MaterialCommunityIcons 
                    name={lesson.completed ? 'check-circle' : 'circle-outline'} 
                    size={20} 
                    color={lesson.completed ? '#10B981' : colors.secondary} 
                  />
                  <Text style={[
                    prepareStyles.lessonTitle,
                    lesson.completed && prepareStyles.completedLesson
                  ]}>
                    {lesson.title}
                  </Text>
                </View>
                <View style={prepareStyles.lessonRight}>
                  <Text style={prepareStyles.lessonDuration}>{lesson.duration}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={colors.secondary} />
                </View>
              </TouchableOpacity>
            ))}

            <View style={prepareStyles.buttonContainer}>
              {module.progress === 0 ? (
                <TouchableOpacity
                  style={prepareStyles.primaryButton}
                  onPress={async () => {
                    const first = module.lessons && module.lessons[0];
                    if (first) {
                      const saved = await getLessonCurrentPageIndex(first.id);
                      const pageIndex = saved ?? findFirstIncompletePageIndex(first);
                      navigation.navigate('prepareLessons', { lessonId: first.id, moduleId: module.id, lessonData: first, initialPageIndex: pageIndex });
                    }
                  }}
                >
                  <Text style={prepareStyles.primaryButtonText}>Start</Text>
                </TouchableOpacity>
              ) : module.progress >= 0.9 && module.progress < 1 ? (
                <TouchableOpacity
                  style={prepareStyles.primaryButton}
                  onPress={async () => {
                    // Finish: go to first incomplete lesson page (or first lesson)
                    const next = (module.lessons || []).find(l => !l.completed) || (module.lessons && module.lessons[0]);
                    if (next) {
                      const saved = await getLessonCurrentPageIndex(next.id);
                      const pageIndex = saved ?? findFirstIncompletePageIndex(next);
                      navigation.navigate('prepareLessons', { lessonId: next.id, moduleId: module.id, lessonData: next, initialPageIndex: pageIndex });
                    }
                  }}
                >
                  <Text style={prepareStyles.primaryButtonText}>Finish</Text>
                </TouchableOpacity>
              ) : module.progress === 1 ? (
                <TouchableOpacity
                  style={prepareStyles.secondaryButton}
                  onPress={async () => {
                    const first = module.lessons && module.lessons[0];
                    if (first) {
                      const saved = await getLessonCurrentPageIndex(first.id);
                      const pageIndex = saved ?? findFirstIncompletePageIndex(first);
                      navigation.navigate('prepareLessons', { lessonId: first.id, moduleId: module.id, lessonData: first, initialPageIndex: pageIndex });
                    }
                  }}
                >
                  <Text style={prepareStyles.secondaryButtonText}>Review</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={prepareStyles.primaryButton}
                  onPress={async () => {
                    const next = (module.lessons || []).find(l => !l.completed) || (module.lessons && module.lessons[0]);
                    if (next) {
                      const saved = await getLessonCurrentPageIndex(next.id);
                      const pageIndex = saved ?? findFirstIncompletePageIndex(next);
                      navigation.navigate('prepareLessons', { lessonId: next.id, moduleId: module.id, lessonData: next, initialPageIndex: pageIndex });
                    }
                  }}
                >
                  <Text style={prepareStyles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const overallProgress = (modules.length > 0) ? (modules.reduce((acc, module) => acc + (Number(module.progress) || 0), 0) / modules.length) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.light }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} translucent={false} />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.light }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 30,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={globalStyles.heading}>Prepare</Text>
        <Text style={prepareStyles.subtitle}>Complete your journey to earthquake safety</Text>

        <View style={[prepareStyles.overallProgress, { backgroundColor: colors.white }]}>
          <View style={prepareStyles.progressHeader}>
            <Text style={prepareStyles.progressLabel}>Overall Progress</Text>
            <Text style={prepareStyles.progressPercent}>{Math.round(overallProgress * 100)}%</Text>
          </View>
          <ProgressBar progress={overallProgress} />
        </View>

        <View style={prepareStyles.modulesList}>
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Prepare;
