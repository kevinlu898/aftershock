import { useNavigation } from "@react-navigation/native";
import { useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, globalStyles } from '../../css';
import { PREPARE_MODULES } from './prepareModules';
import prepareStyles from './prepareStyles';

const Prepare = () => {
  const [expandedModule, setExpandedModule] = useState(null);
  const navigation = useNavigation();

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const ProgressBar = ({ progress }) => (
    <View style={prepareStyles.progressContainer}>
      <View style={[prepareStyles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
  );

  const ModuleCard = ({ module }) => {
    const isExpanded = expandedModule === module.id;
    const statusColor = module.completed ? '#10B981' : module.progress > 0 ? colors.primary : '#9CA3AF';

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
                onPress={() => navigation.navigate("prepareLessons", { lessonId: lesson.id, moduleId: module.id, lessonData: lesson })}
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
                  onPress={() => {
                    const first = module.lessons && module.lessons[0];
                    if (first) navigation.navigate('prepareLessons', { lessonId: first.id, moduleId: module.id, lessonData: first });
                  }}
                >
                  <Text style={prepareStyles.primaryButtonText}>Start</Text>
                </TouchableOpacity>
              ) : module.progress >= 0.9 && module.progress < 1 ? (
                <TouchableOpacity
                  style={prepareStyles.primaryButton}
                  onPress={() => {
                    // Finish: go to first incomplete lesson page (or first lesson)
                    const next = (module.lessons || []).find(l => !l.completed) || (module.lessons && module.lessons[0]);
                    if (next) navigation.navigate('prepareLessons', { lessonId: next.id, moduleId: module.id, lessonData: next });
                  }}
                >
                  <Text style={prepareStyles.primaryButtonText}>Finish</Text>
                </TouchableOpacity>
              ) : module.progress === 1 ? (
                <TouchableOpacity
                  style={prepareStyles.secondaryButton}
                  onPress={() => {
                    const first = module.lessons && module.lessons[0];
                    if (first) navigation.navigate('prepareLessons', { lessonId: first.id, moduleId: module.id, lessonData: first });
                  }}
                >
                  <Text style={prepareStyles.secondaryButtonText}>Review</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={prepareStyles.primaryButton}
                  onPress={() => {
                    const next = (module.lessons || []).find(l => !l.completed) || (module.lessons && module.lessons[0]);
                    if (next) navigation.navigate('prepareLessons', { lessonId: next.id, moduleId: module.id, lessonData: next });
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

  const overallProgress = PREPARE_MODULES.reduce((acc, module) => acc + module.progress, 0) / PREPARE_MODULES.length;

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
          {PREPARE_MODULES.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Prepare;