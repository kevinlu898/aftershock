import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView as HScrollView, Linking, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { colors } from '../../css';
import prepareLessonStyles from './prepareLessonStyles';
import { getLessonById, getLessonCurrentPageIndex, getLessonPages, getModuleById } from './prepareModules';
import completion from './prepareModulesCompletion';

// Simple in-file HTML renderer to avoid external dependency on react-native-render-html
// Supports basic tags: <h3>, <p>, <ul>, <li>, <strong>
import { Platform } from 'react-native';

const SimpleHtmlRenderer = ({ html = '', contentWidth, config = {} }) => {
    if (!html) return null;
    // Very small parser: split by tags and render basics
    // Normalize newlines
    const trimmed = String(html).replace(/\r/g, '').trim();

    // Extract list blocks and paragraphs
    const elements = [];
    // Handle <h3>
    const h3Regex = /<h3>(.*?)<\/h3>/gi;
    let lastIndex = 0;
    let match;
    // Split into tokens: headings, ul blocks, paragraphs
    // First handle UL blocks
    const ulRegex = /<ul>([\s\S]*?)<\/ul>/gi;
    let cursor = 0;
    const parts = [];
    while ((match = ulRegex.exec(trimmed)) !== null) {
        const start = match.index;
        const before = trimmed.slice(cursor, start);
        if (before.trim()) parts.push({ type: 'html', content: before });
        parts.push({ type: 'ul', content: match[1] });
        cursor = ulRegex.lastIndex;
    }
    const tail = trimmed.slice(cursor);
    if (tail.trim()) parts.push({ type: 'html', content: tail });

    // Render parts into React Native elements using Text and View
    return (
        <View>
            {parts.map((part, idx) => {
                if (part.type === 'ul') {
                    // extract li items
                    const liRegex = /<li>(.*?)<\/li>/gi;
                    const items = [];
                    let m;
                    while ((m = liRegex.exec(part.content)) !== null) items.push(m[1]);
                    return (
                        <View key={`ul-${idx}`} style={{ paddingLeft: 12, marginBottom: 12 }}>
                            {items.map((it, i) => (
                                <Text key={`li-${i}`} style={config.tagsStyles?.li || { marginBottom: 8, lineHeight: 22 }}>
                                    {'\u2022 '}{stripTags(it)}
                                </Text>
                            ))}
                        </View>
                    );
                }

                // For generic HTML part replace tags with newlines and basic bold handling
                const cleaned = part.content
                    .replace(/<h3>(.*?)<\/h3>/gi, (s, g1) => `\n__H3__${g1}__H3__\n`)
                    .replace(/<p>(.*?)<\/p>/gi, (s, g1) => `\n${g1}\n`)
                    .replace(/<strong>(.*?)<\/strong>/gi, (s, g1) => `**${g1}**`)
                    .replace(/<br\/?\s*>/gi, '\n');

                const segments = cleaned.split('\n').map(s => s.trim()).filter(Boolean);
                return (
                    <View key={`part-${idx}`} style={{ marginBottom: 8 }}>
                        {segments.map((seg, i) => {
                            if (seg.startsWith('__H3__') && seg.endsWith('__H3__')) {
                                const text = seg.replace(/__H3__(.*)__H3__/i, '$1');
                                return <Text key={`h3-${i}`} style={config.tagsStyles?.h3 || { fontSize: 18, fontWeight: '700', marginVertical: 8 }}>{stripTags(text)}</Text>;
                            }
                            // handle bold markers
                            if (seg.includes('**')) {
                                const partsBold = seg.split(/\*\*/g);
                                return (
                                    <Text key={`p-${i}`} style={config.tagsStyles?.p || { marginBottom: 12 }}>
                                        {partsBold.map((pb, pi) => pi % 2 === 1 ? <Text key={`b-${pi}`} style={config.tagsStyles?.strong || { fontWeight: '700' }}>{stripTags(pb)}</Text> : stripTags(pb))}
                                    </Text>
                                );
                            }
                            return <Text key={`t-${i}`} style={config.tagsStyles?.p || { marginBottom: 12 }}>{stripTags(seg)}</Text>;
                        })}
                    </View>
                );
            })}
        </View>
    );
};

// Utility: remove remaining HTML tags and decode basic entities
const stripTags = (s) => {
    return String(s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
};

// Helper: extract YouTube video id from common URL formats
const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/, // common
    /youtube\.com\/(?:watch\?v=)([A-Za-z0-9_-]{11})/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
};

// Helper to get rendered content for a page: prefer precomputed HTML for text pages
const getPageContent = (page) => {
  if (!page) return '';
  if (page.type === 'text') return page.html || page.body || '';
  return page.body;
};

// Main component for displaying and navigating through lesson content
const PrepareLessons = ({ route, navigation }) => {
  // Extract parameters from navigation route with default values
  const { lessonId = '1-1', moduleId = '1', lessonData, initialPageIndex = 0 } = route?.params || {};

  // State management for component data and UI
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0); // Current active screen index
  const [currentLesson, setCurrentLesson] = useState(null);        // Current lesson data
  const [currentModule, setCurrentModule] = useState(null);        // Current module data
  const [screens, setScreens] = useState([]);                      // Array of available screens
  const [showCompletedView, setShowCompletedView] = useState(false);

  // Get screen width for HTML rendering
  const { width: screenWidth } = Dimensions.get('window');

  // HTML rendering configuration
  const htmlConfig = {
    tagsStyles: {
      h3: { marginBottom: 16, fontSize: 20, fontWeight: '700' },
      p: { marginBottom: 12, lineHeight: 22 },
      strong: { fontWeight: '700' },
      li: { marginBottom: 8, lineHeight: 22 },
    },
  };

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
                        // For video pages pass an object with url + optional caption so VideoScreen can show a description
                        // For text pages use the HTML content via helper (prefers page.html)
                        content: p.type === 'text' ? getPageContent(p) : (p.type === 'video' ? { url: p.videoUrl, caption: p.description || p.caption || p.title || '' } : (p.type === 'checklist' ? p.items : p.questions)),
                    };
                }));
        console.log('prepareLessons: set screens length ->', pages.length);
        // read saved page index from completion state, fallback to initialPageIndex
        (async () => {
          const saved = await getLessonCurrentPageIndex(lesson.id);
          const start = saved ?? initialPageIndex ?? 0;
          // if saved index is past the end it means the lesson was completed and stored as pageCount
          if (pages.length > 0 && start >= pages.length) {
            // mark local state as completed and show Completed view instead of pages
            setCurrentLesson(prev => prev ? { ...prev, completed: true } : prev);
            setShowCompletedView(true);
          } else {
            setCurrentScreenIndex(start);
            setShowCompletedView(false);
          }
        })();
        // subscribe to completion changes to keep local state in sync
        const off = completion.events.on('changed', (state) => {
          // update local module/lesson completed flags if they changed
          try {
            const moduleState = state?.modules?.[module?.id]?.lessons?.[lesson.id];
            if (moduleState) {
              setCurrentLesson(prev => prev ? { ...prev, completed: !!moduleState.completed } : prev);
              setCurrentModule(prev => prev ? { ...prev, completed: !!state.modules[module.id]?.completed } : prev);
            }
          } catch (e) { /* ignore */ }
        });
        return () => off && off();
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
      try {
        await completion.setLessonCurrentPage(currentModule.id, currentLesson.id, next);
        console.log('prepareLessons: persisted page', next);
      } catch (e) {
        console.warn('prepareLessons: failed to persist page', e);
      }
    } else {
      // All screens completed - persist and show Completed view
      try {
        await completion.markLessonCompleted(currentModule.id, currentLesson.id);
        console.log('prepareLessons: lesson marked completed in storage');
      } catch (e) {
        console.warn('prepareLessons: error marking lesson complete', e);
      }
      setCurrentLesson(prev => prev ? { ...prev, completed: true } : prev);
      setCurrentModule(prev => prev ? { ...prev, completed: true } : prev);
      setShowCompletedView(true);
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
            <SimpleHtmlRenderer
                            html={content}
                            contentWidth={screenWidth - 48}
                            config={htmlConfig}
                        />
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
    const videoUrl = content?.url || '';
    const caption = content?.caption || '';
    const videoId = extractYouTubeId(videoUrl);

    const { width: screenWidth } = Dimensions.get('window');
    const sideMargin = 16;
    const playerWidth = Math.max(0, screenWidth - sideMargin * 2);
    const playerHeight = Math.round(playerWidth * 9 / 16);

    return (
      <View style={prepareLessonStyles.lessonScreenContainer}>
        <ScrollView
          style={prepareLessonStyles.lessonContentScroll}
          contentContainerStyle={prepareLessonStyles.lessonScrollContent}
          scrollEnabled={false}
        >
          <View style={{ padding: 12, alignItems: 'center' }}>
            {/* subtle background card behind the white content card */}
            <View style={{ width: '100%', borderRadius: 14, backgroundColor: '#f8faf8', padding: 8 }}>
              <View style={[prepareLessonStyles.lessonContentCard, { borderRadius: 12, overflow: 'hidden', padding: 0 }]}>
                {/* video full-bleed */}
                <View style={{ backgroundColor: '#000', alignItems: 'center' }}>
                  {videoId ? (
                    <View style={{ width: playerWidth, height: playerHeight }}>
                      <YoutubePlayer height={playerHeight} play={false} videoId={videoId} />
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => Linking.openURL(String(videoUrl))} activeOpacity={0.8}>
                      <View style={[prepareLessonStyles.lessonVideoPlaceholder, { width: playerWidth, height: playerHeight, borderRadius: 0 }]}>
                        <MaterialCommunityIcons name="play" size={48} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                {/* caption / content area with same padding as other pages */}
                {caption ? (
                            caption.includes('<') ? (
                                <SimpleHtmlRenderer html={caption} contentWidth={screenWidth - 48} config={htmlConfig} />
                            ) : (
                                <Text style={prepareLessonStyles.lessonContentText}>{caption}</Text>
                            )
                        ) : null}
              </View>
            </View>
          </View>
        </ScrollView>

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

  // Completed view component
  const CompletedScreen = () => (
    <View style={prepareLessonStyles.lessonScreenContainer}>
      <View style={prepareLessonStyles.lessonContentCard}>
        <MaterialCommunityIcons name="check-circle" size={64} color="#10B981" style={{ alignSelf: 'center', marginBottom: 12 }} />
        <Text style={[prepareLessonStyles.lessonPageTitle, { textAlign: 'center', marginBottom: 8 }]}>Lesson Complete</Text>
        <Text style={{ textAlign: 'center', color: '#6B7280', marginBottom: 16 }}>You have completed this lesson. Would you like to review it?</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              // review: go to first page
              setShowCompletedView(false);
              setCurrentScreenIndex(0);
              // persist that we're on first page
              completion.setLessonCurrentPage(currentModule.id, currentLesson.id, 0).catch(() => {});
            }}
            style={[prepareLessonStyles.lessonContinueButton, { marginRight: 8, paddingHorizontal: 20 }]}
          >
            <Text style={prepareLessonStyles.lessonContinueButtonText}>Review</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[prepareLessonStyles.lessonContinueButton, { backgroundColor: '#6B7280', paddingHorizontal: 20 }]}
          >
            <Text style={prepareLessonStyles.lessonContinueButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Renders the current screen based on screen type
  const renderCurrentScreen = () => {
    if (showCompletedView) return <CompletedScreen />;
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
    <>
      <StatusBar backgroundColor="colors.light" barStyle="dark-content" />
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
    </>
  );
};

export default PrepareLessons;