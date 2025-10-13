import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView as HScrollView, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../css';
import prepareLessonStyles from './prepareLessonStyles';
import { getLessonById, getLessonCurrentPageIndex, getLessonPages, getModuleById } from './prepareModules';
import completion from './prepareModulesCompletion';

// Main component for displaying and navigating through lesson content
const PrepareLessons = ({ route, navigation }) => {
  // Extract parameters from navigation route with default values
  const { lessonId = '1-1', moduleId = '1', lessonData, initialPageIndex = 0 } = route?.params || {};

  // State management for component data and UI
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0); // Current active screen index
  const [currentLesson, setCurrentLesson] = useState(null);        // Current lesson data
  const [currentModule, setCurrentModule] = useState(null);        // Current module data
  const [screens, setScreens] = useState([]);                      // Array of available screens

  // Loads lesson and module data when component mounts
  useEffect(() => {
    try {
      // Load lesson data (either from props or by ID)
      const lesson = lessonData || getLessonById(lessonId);
      const module = getModuleById(moduleId);
      
      if (lesson) {
        // Update state and initialize screens
        setCurrentLesson(lesson);
        setCurrentModule(module);
        const pages = getLessonPages(lesson);
        console.log('prepareLessons: loaded lesson', lesson.id, 'pages:', pages.map(p => p.id));
        setScreens(pages.map(p => {
          return {
            type: p.type === 'text' ? 'lesson' : p.type,
            title: p.title || 'Page',
            icon: p.type === 'text' ? 'book-open-variant' : (p.type === 'video' ? 'play-circle' : (p.type === 'checklist' ? 'checklist' : 'puzzle')),
            content: p.type === 'text' ? p.body : (p.type === 'video' ? p.videoUrl : (p.type === 'checklist' ? p.items : p.questions)),
          };
        }));
        console.log('prepareLessons: set screens length ->', pages.length);
        // read saved page index from completion state, fallback to initialPageIndex
        (async () => {
          const saved = await getLessonCurrentPageIndex(lesson.id);
          const start = saved ?? initialPageIndex ?? 0;
          setCurrentScreenIndex(start);
        })();
      } else {
        // Lesson not found - show error and navigate back
        Alert.alert('Error', 'Lesson not found');
        navigation.goBack();
      }
    } catch (error) {
      // Handle errors during data loading
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
      navigation.goBack();
    }
  }, [lessonId, lessonData, moduleId, initialPageIndex]);

  // Scroll active menu item into view and center it
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuRef.current) return;
    const screenWidth = Dimensions.get('window').width;
    const total = screens.length;
    // compute offsets
    const itemFull = 110 + 12; // active width
    const compact = 44 + 12; // compact width
    // Build cumulative widths to compute exact offset
    let pos = 0;
    for (let i = 0; i < currentScreenIndex; i++) {
      pos += (i === currentScreenIndex ? itemFull : compact);
    }

    if (currentScreenIndex === 0) {
      // anchor left
      try { menuRef.current.scrollTo({ x: 0, y: 0, animated: true }); } catch (e) {}
      return;
    }
    if (currentScreenIndex === total - 1) {
      // anchor right: scroll to max
      const estimatedTotalWidth = itemFull + compact * (total - 1);
      const offsetRight = Math.max(0, estimatedTotalWidth - screenWidth + 24);
      try { menuRef.current.scrollTo({ x: offsetRight, y: 0, animated: true }); } catch (e) {}
      return;
    }

    // center other tabs
    const centerOffset = pos - (screenWidth / 2) + (itemFull / 2);
    try { menuRef.current.scrollTo({ x: Math.max(0, centerOffset), y: 0, animated: true }); } catch (e) {}
  }, [currentScreenIndex]);

  // Calculate progress percentage (0 to 1)
  const progress = screens.length > 0 ? (currentScreenIndex + 1) / screens.length : 0;

  // Show loading state while data is being fetched
  if (!currentLesson) {
    return (
      <View style={prepareLessonStyles.lessonLoadingContainer}>
        <MaterialCommunityIcons name="loading" size={40} color={colors.primary} />
        <Text style={prepareLessonStyles.lessonLoadingText}>Loading lesson...</Text>
      </View>
    );
  }

  // If lesson loaded but there are no pages, show a friendly fallback
  if (screens.length === 0) {
    return (
      <SafeAreaView style={prepareLessonStyles.lessonSafeArea}>
        <View style={[prepareLessonStyles.lessonContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={prepareLessonStyles.lessonLoadingText}>No content available for this lesson.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Handles progression to next screen or lesson completion
  const markScreenComplete = async () => {
    console.log('markScreenComplete called, currentScreenIndex=', currentScreenIndex, 'screens.length=', screens.length);
    if (currentScreenIndex < screens.length - 1) {
      // Move to next screen
      const next = currentScreenIndex + 1;
      setCurrentScreenIndex(next);
      // persist current page
      await completion.setLessonCurrentPage(currentModule.id, currentLesson.id, next);
    } else {
      // All screens completed - show completion message
      Alert.alert('Lesson Complete!', 'Congratulations! You have completed this lesson.',
        [{ text: 'Continue', onPress: () => navigation.goBack() }]
      );
      // mark lesson completed and update UI state
      await completion.markLessonCompleted(currentModule.id, currentLesson.id);
      setCurrentLesson(prev => prev ? { ...prev, completed: true } : prev);
      setCurrentModule(prev => prev ? { ...prev, completed: true } : prev);
    }
  };

  // Allows direct navigation to any screen via tab clicks
  const goToScreen = (index) => {
    setCurrentScreenIndex(index);
  };

  // Displays text-based lesson content in a scrollable view
  const LessonScreen = ({ content }) => {
    return (
      <View style={prepareLessonStyles.lessonScreenContainer}>
        {/* Scrollable content area */}
        <ScrollView 
          style={prepareLessonStyles.lessonContentScroll}
          contentContainerStyle={prepareLessonStyles.lessonScrollContent}
        >
          <View style={prepareLessonStyles.lessonContentCard}>
            <Text style={prepareLessonStyles.lessonContentText}>{content}</Text>
          </View>
        </ScrollView>
        {/* Continue button */}
        <TouchableOpacity 
          style={prepareLessonStyles.lessonContinueButton}
          onPress={markScreenComplete}
        >
          <Text style={prepareLessonStyles.lessonContinueButtonText}>Continue</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Displays video content with completion tracking
  const VideoScreen = ({ content }) => {
    const [watched, setWatched] = useState(false); // Track if video has been watched

    return (
      <View style={prepareLessonStyles.lessonScreenContainer}>
        <View style={prepareLessonStyles.lessonContentCard}>
          {/* Video placeholder and description */}
          <View style={prepareLessonStyles.lessonVideoContainer}>
            <View style={prepareLessonStyles.lessonVideoPlaceholder}>
              <MaterialCommunityIcons name="play" size={48} color="#fff" />
            </View>
            <Text style={prepareLessonStyles.lessonVideoCaption}>
              {content || 'Earthquake Safety Demonstration'}
            </Text>
          </View>

          {/* Conditional rendering based on watched state */}
          {!watched ? (
            // Show watch button if not watched
            <TouchableOpacity 
              style={prepareLessonStyles.lessonWatchButton}
              onPress={() => setWatched(true)}
            >
              <Text style={prepareLessonStyles.lessonWatchButtonText}>Mark as Watched</Text>
            </TouchableOpacity>
          ) : (
            // Show completion badge if watched
            <View style={prepareLessonStyles.lessonCompletedBadge}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              <Text style={prepareLessonStyles.lessonCompletedText}>Video Watched</Text>
            </View>
          )}
        </View>

        {/* Continue button (disabled until video is watched) */}
        <TouchableOpacity 
          style={[
            prepareLessonStyles.lessonContinueButton,
            !watched && prepareLessonStyles.lessonContinueButtonDisabled
          ]}
          onPress={markScreenComplete}
          disabled={!watched}
        >
          <Text style={prepareLessonStyles.lessonContinueButtonText}>
            {watched ? 'Continue' : 'Watch Video to Continue'}
          </Text>
          {watched && <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    );
  };

  // Interactive checklist where users mark off completed items
  const ChecklistScreen = ({ content }) => {
    const [checklist, setChecklist] = useState(content); // Local state for checklist items
    const allCompleted = checklist.every(item => item.completed); // Check if all items completed

    // Toggles completion state of a checklist item
    const toggleItem = (itemId) => {
      const updatedChecklist = checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setChecklist(updatedChecklist);
    };

    return (
      <View style={prepareLessonStyles.lessonScreenContainer}>
        {/* Scrollable checklist area */}
        <ScrollView 
          style={prepareLessonStyles.lessonContentScroll}
          contentContainerStyle={prepareLessonStyles.lessonScrollContent}
        >
          <View style={prepareLessonStyles.lessonContentCard}>
            <Text style={prepareLessonStyles.lessonChecklistDescription}>
              Complete the following tasks:
            </Text>

            {/* Single checklist container - not individual cards */}
            <View style={prepareLessonStyles.lessonChecklistContainer}>
              {checklist.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    prepareLessonStyles.lessonChecklistItem,
                    item.completed && prepareLessonStyles.lessonChecklistItemCompleted
                  ]}
                  onPress={() => toggleItem(item.id)}
                >
                  <View style={prepareLessonStyles.lessonChecklistLeft}>
                    {/* Custom checkbox */}
                    <View style={[
                      prepareLessonStyles.lessonCheckbox,
                      item.completed && prepareLessonStyles.lessonCheckboxCompleted
                    ]}>
                      {item.completed && (
                        <MaterialCommunityIcons name="check" size={16} color="#fff" />
                      )}
                    </View>
                    {/* Checklist item text */}
                    <Text style={[
                      prepareLessonStyles.lessonChecklistText,
                      item.completed && prepareLessonStyles.lessonChecklistTextCompleted
                    ]}>
                      {item.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Completion badge (shown when all items completed) */}
            {allCompleted && (
              <View style={prepareLessonStyles.lessonCompletedBadge}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                <Text style={prepareLessonStyles.lessonCompletedText}>All items completed!</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Continue button (disabled until all items completed) */}
        <TouchableOpacity 
          style={[
            prepareLessonStyles.lessonContinueButton,
            !allCompleted && prepareLessonStyles.lessonContinueButtonDisabled
          ]}
          onPress={markScreenComplete}
          disabled={!allCompleted}
        >
          <Text style={prepareLessonStyles.lessonContinueButtonText}>
            {allCompleted ? 'Continue' : 'Complete All Items to Continue'}
          </Text>
          {allCompleted && <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    );
  };

  // Interactive quiz with multiple-choice questions
  const QuizScreen = ({ content }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);        // Current question index
    const [userAnswers, setUserAnswers] = useState({});               // User's answers by question ID
    const [showResults, setShowResults] = useState(false);            // Whether to show results screen

    const questions = content || [];                                  // Quiz questions array
    const currentQ = questions[currentQuestion];                      // Current question object

    // Records user's answer for current question
    const handleAnswerSelect = (questionId, answerIndex) => {
      setUserAnswers({ ...userAnswers, [questionId]: answerIndex });
    };

    // Advances to next question or shows results if last question
    const handleNextQuestion = () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        console.log('Quiz finished, showing results. currentScreenIndex=', currentScreenIndex, 'screens.length=', screens.length);
        setShowResults(true);
      }
    };

    // Calculates user's quiz score based on correct answers
    const calculateScore = () => {
      let correct = 0;
      questions.forEach(q => {
        if (userAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      });
      return { correct, total: questions.length };
    };

    // Show quiz results screen
    if (showResults) {
      const { correct, total } = calculateScore();
      const passed = correct >= total * 0.7; // 70% passing threshold
      console.log('Quiz results shown, passed=', passed, 'currentScreenIndex=', currentScreenIndex, 'screens.length=', screens.length);

      return (
        <View style={prepareLessonStyles.lessonScreenContainer}>
          <View style={prepareLessonStyles.lessonContentCard}>
            {/* Results icon (trophy for pass, alert for fail) */}
            <MaterialCommunityIcons 
              name={passed ? 'trophy' : 'alert-circle'} 
              size={48} 
              color={passed ? '#F59E0B' : '#EF4444'} 
              style={prepareLessonStyles.lessonScreenIcon}
            />
            <Text style={prepareLessonStyles.lessonQuizResultTitle}>
              {passed ? 'Quiz Passed! 🎉' : 'Quiz Results'}
            </Text>
            <Text style={prepareLessonStyles.lessonQuizResultScore}>
              {correct} out of {total} correct
            </Text>
            <Text style={prepareLessonStyles.lessonQuizResultText}>
              {passed 
                ? 'Great job! You understand the key concepts.'
                : 'Review the material and try again.'
              }
            </Text>
          </View>

          {/* Continue or retry button */}
          <TouchableOpacity 
            style={prepareLessonStyles.lessonContinueButton}
            onPress={passed ? () => {
              console.log('Quiz Continue pressed - will call markScreenComplete. currentScreenIndex=', currentScreenIndex, 'screens.length=', screens.length);
              markScreenComplete();
            } : () => {
              setShowResults(false);
              setCurrentQuestion(0);
              setUserAnswers({});
            }}
          >
            <Text style={prepareLessonStyles.lessonContinueButtonText}>
              {passed ? 'Continue' : 'Try Again'}
            </Text>
            {passed && <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      );
    }

    // Show current question screen
    return (
      <View style={prepareLessonStyles.lessonScreenContainer}>
        {/* Added ScrollView to fix scrolling issue */}
        <ScrollView 
          style={prepareLessonStyles.lessonContentScroll}
          contentContainerStyle={prepareLessonStyles.lessonScrollContent}
        >
          <View style={prepareLessonStyles.lessonContentCard}>
            {/* Quiz progress indicator */}
            <View style={prepareLessonStyles.lessonQuizProgress}>
              <Text style={prepareLessonStyles.lessonQuizProgressText}>
                Question {currentQuestion + 1} of {questions.length}
              </Text>
              <View style={prepareLessonStyles.lessonQuizProgressBar}>
                <View style={[
                  prepareLessonStyles.lessonQuizProgressFill, 
                  { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
                ]} />
              </View>
            </View>

            {/* Current question text */}
            <Text style={prepareLessonStyles.lessonQuestionText}>{currentQ?.question}</Text>

            {/* Answer options */}
            <View style={prepareLessonStyles.lessonOptionsContainer}>
              {currentQ?.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    prepareLessonStyles.lessonOptionButton,
                    userAnswers[currentQ.id] === index && prepareLessonStyles.lessonOptionSelected
                  ]}
                  onPress={() => handleAnswerSelect(currentQ.id, index)}
                >
                  <View style={[
                    prepareLessonStyles.lessonOptionIndicator,
                    userAnswers[currentQ.id] === index && prepareLessonStyles.lessonOptionIndicatorSelected
                  ]}>
                    <Text style={prepareLessonStyles.lessonOptionLetter}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[
                    prepareLessonStyles.lessonOptionText,
                    userAnswers[currentQ.id] === index && prepareLessonStyles.lessonOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Next question button (disabled until answer selected) */}
        <TouchableOpacity 
          style={[
            prepareLessonStyles.lessonContinueButton,
            userAnswers[currentQ.id] === undefined && prepareLessonStyles.lessonContinueButtonDisabled
          ]}
          onPress={handleNextQuestion}
          disabled={userAnswers[currentQ.id] === undefined}
        >
          <Text style={prepareLessonStyles.lessonContinueButtonText}>
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Renders the current screen based on screen type
  const renderCurrentScreen = () => {
    const currentScreen = screens[currentScreenIndex];
    if (!currentScreen) return null;

    switch (currentScreen.type) {
      case 'lesson':
        return <LessonScreen content={currentScreen.content} />;
      case 'video':
        return <VideoScreen content={currentScreen.content} />;
      case 'checklist':
        return <ChecklistScreen content={currentScreen.content} />;
      case 'quiz':
        return <QuizScreen content={currentScreen.content} />;
      default:
        return <LessonScreen content={currentScreen.content} />;
    }
  };

  // Main component render
  return (
    <SafeAreaView style={prepareLessonStyles.lessonSafeArea}>
      <View style={prepareLessonStyles.lessonContainer}>
        {/* Redesigned Header - Clean layout with back button top left */}
        <View style={prepareLessonStyles.lessonHeader}>
          <View style={prepareLessonStyles.lessonHeaderLeft}>
            <TouchableOpacity 
              style={prepareLessonStyles.lessonBackButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={prepareLessonStyles.lessonProgressContainer}>
              <Text style={prepareLessonStyles.lessonProgressText}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>
          
          <View style={prepareLessonStyles.lessonHeaderContent}>
            <Text style={prepareLessonStyles.lessonModuleTitle} numberOfLines={1}>
              {currentModule?.title || 'Module'}
            </Text>
            <Text style={prepareLessonStyles.lessonPageTitle} numberOfLines={2}>
              {currentLesson?.title}
            </Text>
          </View>
        </View>

        {/* Horizontal menu for lesson pages */}
        <View style={prepareLessonStyles.lessonMenuContainer}>
          <HScrollView ref={menuRef} horizontal showsHorizontalScrollIndicator={false} style={prepareLessonStyles.lessonMenuScroll} contentContainerStyle={{ paddingHorizontal: 6 }}>
            {screens.map((screen, index) => (
              <TouchableOpacity
                key={screen.id || index}
                style={index === currentScreenIndex ? [
                  prepareLessonStyles.lessonMenuItem,
                  prepareLessonStyles.lessonMenuItemActive
                ] : prepareLessonStyles.lessonMenuItemCompact}
                onPress={() => goToScreen(index)}
              >
                <MaterialCommunityIcons name={screen.icon} size={18} color={index === currentScreenIndex ? '#fff' : colors.muted} />
                {/* show label only for active tab */}
                {index === currentScreenIndex && (
                  <Text style={[
                    prepareLessonStyles.lessonMenuItemText,
                    prepareLessonStyles.lessonMenuItemTextActive,
                    { marginLeft: 8 }
                  ]}>
                    {index + 1}. {screen.title}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </HScrollView>
        </View>

        {/* Dynamic content area */}
        <View style={prepareLessonStyles.lessonContentArea}>
          {renderCurrentScreen()}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PrepareLessons;