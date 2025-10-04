import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { globalStyles, colors, fontSizes } from '../../css';
import prepareStyles from 'screens/Prepare/prepareStyles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Prepare = () => {
  const [expandedModule, setExpandedModule] = useState(null);

  // Get rid of this and move it to prepareModules.js
  const PREPARE_MODULES = [
    {
      id: '1',
      title: 'Understand Earthquakes',
      icon: 'brain',
      description: 'Know your risk and the science',
      progress: 0.4,
      completed: false,
      lessons: [
        { id: '1-1', title: 'How Earthquakes Work', duration: '5 min', completed: true },
        { id: '1-2', title: 'Know Your Risk', duration: '8 min', completed: true },
        { id: '1-3', title: 'Myths vs Facts', duration: '5 min', completed: false },
      ]
    },
    {
      id: '2',
      title: 'Make Your Plan',
      icon: 'clipboard-list',
      description: 'Create your emergency plan',
      progress: 1.0,
      completed: true,
      lessons: [
        { id: '2-1', title: 'Learn the Basics', duration: '10 min', completed: true },
        { id: '2-2', title: 'Define Contacts', duration: '15 min', completed: true },
        { id: '2-3', title: 'Practice Your Plan', duration: '5 min', completed: true },
      ]
    },
    {
      id: '3',
      title: 'Build Your Kits',
      icon: 'backpack',
      description: 'Assemble emergency supplies',
      progress: 0.2,
      completed: false,
      lessons: [
        { id: '3-1', title: 'Go-Bag Essentials', duration: '20 min', completed: true },
        { id: '3-2', title: 'Home Kit', duration: '25 min', completed: false },
        { id: '3-3', title: 'Car Kit', duration: '15 min', completed: false },
      ]
    },
    {
      id: '4',
      title: 'Secure Your Home',
      icon: 'home-alert',
      description: 'Prevent injuries and damage',
      progress: 0.0,
      completed: false,
      lessons: [
        { id: '4-1', title: 'Identify Hazards', duration: '15 min', completed: false },
        { id: '4-2', title: 'Shut Off Utilities', duration: '10 min', completed: false },
      ]
    },
    {
      id: '5',
      title: 'Finalize & Review',
      icon: 'check-circle',
      description: 'Tie up loose ends',
      progress: 0.0,
      completed: false,
      lessons: [
        { id: '5-1', title: 'Document Belongings', duration: '30 min', completed: false },
        { id: '5-2', title: 'Review Insurance', duration: '15 min', completed: false },
      ]
    },
  ];

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  // Progress Bar Component
  const ProgressBar = ({ progress }) => (
    <View style={prepareStyles.progressContainer}>
      <View style={[prepareStyles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
  );

  // Module Card Component
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
              <MaterialCommunityIcons 
                name={module.icon} 
                size={24} 
                color={statusColor} 
              />
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
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={16} 
                    color={colors.secondary} 
                  />
                </View>
              </TouchableOpacity>
            ))}
            
            <View style={prepareStyles.buttonContainer}>
              <TouchableOpacity style={prepareStyles.primaryButton}>
                <Text style={prepareStyles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
              {module.completed && (
                <TouchableOpacity style={prepareStyles.secondaryButton}>
                  <Text style={prepareStyles.secondaryButtonText}>Review</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const overallProgress = PREPARE_MODULES.reduce((acc, module) => acc + module.progress, 0) / PREPARE_MODULES.length;

  // Outputted Interface - Home Page for Prepare Section
  return (
    <ScrollView 
      style={globalStyles.container}
      contentContainerStyle={prepareStyles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={globalStyles.heading}>Prepare</Text>
      <Text style={globalStyles.subtitle}>Complete your journey to earthquake safety</Text>
      <br></br>
      {/* Overall Progress */}
      <View style={prepareStyles.overallProgress}>
        <View style={prepareStyles.progressHeader}>
          <Text style={prepareStyles.progressLabel}>Overall Progress</Text>
          <Text style={prepareStyles.progressPercent}>{Math.round(overallProgress * 100)}%</Text>
        </View>
        <ProgressBar progress={overallProgress} />
      </View>

      {/* Modules List */}
      <View style={prepareStyles.modulesList}>
        {PREPARE_MODULES.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </View>
    </ScrollView>
  );
};

export default Prepare;