import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView as HScrollView, Linking, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { colors } from '../../css';
import prepareLessonStyles from './prepareLessonStyles';
import { getLessonById, getLessonCurrentPageIndex, getLessonPages, getModuleById } from './prepareModules';
import completion from './prepareModulesCompletion';

const BUTTON_ROUTE_MAP = {
  'My Plan': 'myPlan',
  'Contact Info': 'contactInfo',
  'Medical Info': 'medicalInfo',
  'Important Documents': 'importantDocuments',
};

const handleButtonPress = (btnText, navigation) => {
  const route = BUTTON_ROUTE_MAP[(btnText || '').trim()] || null;
  if (route) {
    try { navigation.navigate(route); } catch (e) { console.warn('navigate failed', e); }
  } else {
    console.warn('No route mapped for button:', btnText);
  }
};

// Render HTML
const SimpleHtmlRenderer = ({ html = '', contentWidth, config = {} }) => {
    if (!html) return null;
    const trimmed = String(html).replace(/\r/g, '').trim();

    const elements = [];
    const ulRegex = /<ul>([\s\S]*?)<\/ul>/gi;
    let cursor = 0;
    const parts = [];
    let match;
    while ((match = ulRegex.exec(trimmed)) !== null) {
        const start = match.index;
        const before = trimmed.slice(cursor, start);
        if (before.trim()) parts.push({ type: 'html', content: before });
        parts.push({ type: 'ul', content: match[1] });
        cursor = ulRegex.lastIndex;
    }
    const tail = trimmed.slice(cursor);
    if (tail.trim()) parts.push({ type: 'html', content: tail });

    return (
        <View>
            {parts.map((part, idx) => {
                if (part.type === 'ul') {
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
                const buttonRegex = /<button(?:\s+[^>]*)?>([\s\S]*?)<\/button>/gi;
                const placeholderHtml = part.content.replace(buttonRegex, (s, g1) => `\n__BTN__${g1}__BTN__\n`);

                const cleaned = placeholderHtml
                    .replace(/<h3>(.*?)<\/h3>/gi, (s, g1) => `\n__H3__${g1}__H3__\n`)
                    .replace(/<p>(.*?)<\/p>/gi, (s, g1) => `\n${g1}\n`)
                    .replace(/<strong>(.*?)<\/strong>/gi, (s, g1) => `**${g1}**`)
                    .replace(/<br\/?\s*>/gi, '\n');

                const segments = cleaned.split('\n').map(s => s.trim()).filter(Boolean);
                return (
                    <View key={`part-${idx}`} style={{ marginBottom: 8 }}>
                        {segments.map((seg, i) => {
                            if (seg.startsWith('__BTN__') && seg.endsWith('__BTN__')) {
                                const btnText = seg.replace(/^__BTN__(.*)__BTN__$/i, '$1').trim();
                                return (
                                    <TouchableOpacity
                                        key={`btn-${i}`}
                                        activeOpacity={0.87}
                                        onPress={() => {
                                            try {
                                                if (typeof config.onButton === 'function') config.onButton(btnText);
                                                else handleButtonPress(btnText, config.navigation);
                                            } catch (_e) {}
                                        }}
                                        style={config.buttonStyle || {
                                            backgroundColor: colors.primary, 
                                            paddingVertical: 12,
                                            paddingHorizontal: 16,
                                            borderRadius: 10,
                                            alignSelf: 'center',
                                            marginTop: 12,
                                            minWidth: 140,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: '#000',
                                            shadowOpacity: 0.08,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowRadius: 6,
                                            elevation: 3
                                        }}
                                    >
                                        <Text style={config.buttonTextStyle || { color: '#fff', fontWeight: '800', fontSize: 15 }}>
                                            {btnText}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }

                            if (seg.startsWith('__H3__') && seg.endsWith('__H3__')) {
                                const text = seg.replace(/__H3__(.*)__H3__/i, '$1');
                                return <Text key={`h3-${i}`} style={config.tagsStyles?.h3 || { fontSize: 18, fontWeight: '700', marginVertical: 8 }}>{stripTags(text)}</Text>;
                            }
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

const stripTags = (s) => {
    return String(s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
};

// Youtube video
const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/, 
    /youtube\.com\/(?:watch\?v=)([A-Za-z0-9_-]{11})/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
};

const getPageContent = (page) => {
  if (!page) return '';
  if (page.type === 'text') return page.html || page.body || '';
  return page.body;
};

// Main lessons component
const PrepareLessons = ({ route, navigation }) => {
  const { lessonId = '1-1', moduleId = '1', lessonData, initialPageIndex = 0 } = route?.params || {};

  const [currentScreenIndex, setCurrentScreenIndex] = useState(0); 
  const [currentLesson, setCurrentLesson] = useState(null);        
  const [currentModule, setCurrentModule] = useState(null);       
  const [screens, setScreens] = useState([]);                      
  const [showCompletedView, setShowCompletedView] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const htmlConfig = {
    tagsStyles: {
      h3: { marginBottom: 16, fontSize: 20, fontWeight: '700' },
      p: { marginBottom: 12, lineHeight: 22 },
      strong: { fontWeight: '700' },
      li: { marginBottom: 8, lineHeight: 22 },
    },
  };

  // Loads data
  useEffect(() => {
    try {
      const lesson = lessonData || getLessonById(lessonId);
      const module = getModuleById(moduleId);
      
      if (lesson) {
        setCurrentLesson(lesson);
        setCurrentModule(module);
        const pages = getLessonPages(lesson);
        setScreens(pages.map(p => {
                    return {
                        id: p.id,
                        type: p.type === 'text' ? 'lesson' : p.type,
                        title: p.title || 'Page',
                        icon: p.type === 'text' ? 'book-open-variant' : (p.type === 'video' ? 'play-circle' : (p.type === 'checklist' ? 'checkbox-multiple-marked-circle-outline' : 'checkbox-marked-circle-outline')),
                        content: p.type === 'text' ? getPageContent(p) : (p.type === 'video' ? { url: p.videoUrl, caption: p.description || p.caption || p.title || '' } : (p.type === 'checklist' ? p.items : p.questions)),
                    };
                }));
        (async () => {
          const saved = await getLessonCurrentPageIndex(lesson.id);
          const start = saved ?? initialPageIndex ?? 0;
          if (pages.length > 0 && start >= pages.length) {
            setCurrentLesson(prev => prev ? { ...prev, completed: true } : prev);
            setShowCompletedView(true);
          } else {
            setCurrentScreenIndex(start);
            setShowCompletedView(false);
          }
        })();
        const off = completion.events.on('changed', (state) => {
          try {
            const moduleState = state?.modules?.[module?.id]?.lessons?.[lesson.id];
            if (moduleState) {
              setCurrentLesson(prev => prev ? { ...prev, completed: !!moduleState.completed } : prev);
              setCurrentModule(prev => prev ? { ...prev, completed: !!state.modules[module.id]?.completed } : prev);
            }
          } catch (e) {
            // ignore
           }
        });
        return () => off && off();
      } else {
        Alert.alert('Error', 'Lesson not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
      navigation.goBack();
    }
  }, [lessonId, lessonData, moduleId, initialPageIndex]);

  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuRef.current) return;
    const screenWidth = Dimensions.get('window').width;
    const total = screens.length;
    const itemFull = 110 + 12; 
    const compact = 44 + 12; 
    const pos = currentScreenIndex * compact;

    if (currentScreenIndex === 0) {
      try { menuRef.current.scrollTo({ x: 0, y: 0, animated: true }); } catch (e) {}
      return;
    }
    if (currentScreenIndex === total - 1) {
      const estimatedTotalWidth = itemFull + compact * (total - 1);
      const offsetRight = Math.max(0, estimatedTotalWidth - screenWidth + 24);
      try { menuRef.current.scrollTo({ x: offsetRight, y: 0, animated: true }); } catch (e) {}
      return;
    }

    const centerOffset = pos - (screenWidth / 2) + (itemFull / 2);
    try { menuRef.current.scrollTo({ x: Math.max(0, centerOffset), y: 0, animated: true }); } catch (e) {}
  }, [currentScreenIndex]);

  const progress = screens.length > 0 ? (currentScreenIndex + 1) / screens.length : 0;
  if (!currentLesson) {
    return (
      <View style={prepareLessonStyles.lessonLoadingContainer}>
        <MaterialCommunityIcons name="loading" size={40} color={colors.primary} />
        <Text style={prepareLessonStyles.lessonLoadingText}>Loading lesson...</Text>
      </View>
    );
  }

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

// Move between screens and mark progress
  const markScreenComplete = async () => {
    console.log('markScreenComplete called, currentScreenIndex=', currentScreenIndex, 'screens.length=', screens.length);
    if (currentScreenIndex < screens.length - 1) {
      const next = currentScreenIndex + 1;
      setCurrentScreenIndex(next);
      try {
        await completion.setLessonCurrentPage(currentModule.id, currentLesson.id, next);
        console.log('prepareLessons: persisted page', next);
      } catch (e) {
        console.warn('prepareLessons: failed to persist page', e);
      }
    } else {
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

  const goToScreen = (index) => {
    setCurrentScreenIndex(index);
  };

  // Text content
  const LessonScreen = ({ content }) => {
    return (
      <View style={prepareLessonStyles.lessonScreenContainer}>
        <ScrollView 
          style={prepareLessonStyles.lessonContentScroll}
          contentContainerStyle={prepareLessonStyles.lessonScrollContent}
        >
          <View style={prepareLessonStyles.lessonContentCard}>
            <SimpleHtmlRenderer
                html={content}
                contentWidth={screenWidth - 48}
                config={{
                  ...htmlConfig,
                  onButton: (btnText) => {
                    if (typeof htmlConfig.onButton === 'function') {
                      htmlConfig.onButton(btnText);
                    } else {
                      handleButtonPress(btnText, navigation);
                    }
                  },
                  navigation, 
                }}
            />
          </View>
        </ScrollView>
        <TouchableOpacity 
          style={prepareLessonStyles.lessonContinueButton}
          onPress={markScreenComplete}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={prepareLessonStyles.lessonContinueButtonText}>Continue</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Video content
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
            <View style={{ width: '100%', borderRadius: 14, backgroundColor: '#f8faf8', padding: 8 }}>
              <View style={[prepareLessonStyles.lessonContentCard, { borderRadius: 12, overflow: 'hidden', padding: 0 }]}>
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

                {caption ? (
                            caption.includes('<') ? (
                                <SimpleHtmlRenderer html={caption} contentWidth={screenWidth - 48} config={{
                                  ...htmlConfig,
                                  onButton: (btnText) => {
                                    handleButtonPress(btnText, navigation);
                                  },
                                  navigation,
                                }} />
                            ) : (
                                <Text style={prepareLessonStyles.lessonVideoCaption}>{caption}</Text>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={prepareLessonStyles.lessonContinueButtonText}>Continue</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Checklist content
  const ChecklistScreen = ({ content, pageId }) => {
    const initial = Array.isArray(content) ? content : [];
    const [checklist, setChecklist] = useState(initial); 
    const allCompleted = checklist.length ? checklist.every(item => item.completed) : false; 

    const storageKey = currentModule && currentLesson && pageId ? `prepare_checklist:${currentModule.id}:${currentLesson.id}:${pageId}` : null;

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        if (!storageKey) return;
        try {
          const raw = await AsyncStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (mounted && Array.isArray(parsed)) {
              const merged = initial.map(it => {
                const found = parsed.find(p => p.id === it.id);
                return found ? { ...it, completed: !!found.completed } : { ...it };
              });
              setChecklist(merged);
              return;
            }
          }
          setChecklist(initial);
        } catch (e) {
          // ignore
        }
      };
      load();
      return () => { mounted = false; };
    }, [storageKey, pageId]);

    useEffect(() => {
      if (!storageKey) return;
      AsyncStorage.setItem(storageKey, JSON.stringify(checklist)).catch(() => {});
    }, [checklist, storageKey]);

    const toggleItem = (itemId) => {
      const updatedChecklist = checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setChecklist(updatedChecklist);
    };

    return (
      <View style={prepareLessonStyles.lessonScreenContainer}>
        <ScrollView 
          style={prepareLessonStyles.lessonContentScroll}
          contentContainerStyle={prepareLessonStyles.lessonScrollContent}
        >
          <View style={prepareLessonStyles.lessonContentCard}>
            <Text style={prepareLessonStyles.lessonChecklistDescription}>
              Complete the following tasks:
            </Text>

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
                    <View style={[
                      prepareLessonStyles.lessonCheckbox,
                      item.completed && prepareLessonStyles.lessonCheckboxCompleted
                    ]}>
                      {item.completed && (
                        <MaterialCommunityIcons name="check" size={16} color="#fff" />
                      )}
                    </View>
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

            {allCompleted && (
              <View style={prepareLessonStyles.lessonCompletedBadge}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                <Text style={prepareLessonStyles.lessonCompletedText}>All items completed!</Text>
              </View>
            )}
          </View>
        </ScrollView>

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

  // Quiz content
  const QuizScreen = ({ content }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);       
    const [userAnswers, setUserAnswers] = useState({});               
    const [showResults, setShowResults] = useState(false);          

    const questions = content || [];                                 
    const currentQ = questions[currentQuestion];                

    const handleAnswerSelect = (questionId, answerIndex) => {
      setUserAnswers({ ...userAnswers, [questionId]: answerIndex });
    };

    const handleNextQuestion = () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        console.log('Quiz finished, showing results. currentScreenIndex=', currentScreenIndex, 'screens.length=', screens.length);
        setShowResults(true);
      }
    };
    const calculateScore = () => {
      let correct = 0;
      questions.forEach(q => {
        if (userAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      });
      return { correct, total: questions.length };
    };
    if (showResults) {
      const { correct, total } = calculateScore();
      const passed = correct >= total * 0.7;
      console.log('Quiz results shown, passed=', passed, 'currentScreenIndex=', currentScreenIndex, 'screens.length=', screens.length);

      return (
        <View style={prepareLessonStyles.lessonScreenContainer}>
          <View style={prepareLessonStyles.lessonContentCard}>
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

    return (
      <View style={prepareLessonStyles.lessonScreenContainer}>
        <ScrollView 
          style={prepareLessonStyles.lessonContentScroll}
          contentContainerStyle={prepareLessonStyles.lessonScrollContent}
        >
          <View style={prepareLessonStyles.lessonContentCard}>
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
            <Text style={prepareLessonStyles.lessonQuestionText}>{currentQ?.question}</Text>

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

        <TouchableOpacity 
          style={[
            prepareLessonStyles.lessonContinueButton,
            userAnswers[currentQ.id] === undefined && prepareLessonStyles.lessonContinueButtonDisabled
          ]}
          onPress={handleNextQuestion}
          disabled={userAnswers[currentQ.id] === undefined}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={prepareLessonStyles.lessonContinueButtonText}>
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Complete screen
  const CompletedScreen = () => (
    <View style={prepareLessonStyles.lessonScreenContainer}>
      <View style={prepareLessonStyles.lessonContentCard}>
        <MaterialCommunityIcons name="check-circle" size={64} color="#10B981" style={{ alignSelf: 'center', marginBottom: 12 }} />
        <Text style={[prepareLessonStyles.lessonPageTitle, { textAlign: 'center', marginBottom: 8 }]}>Lesson Complete</Text>
        <Text style={{ textAlign: 'center', color: '#6B7280', marginBottom: 16 }}>You have completed this lesson. Would you like to review it?</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              setShowCompletedView(false);
              setCurrentScreenIndex(0);
              completion.setLessonCurrentPage(currentModule.id, currentLesson.id, 0).catch(() => {});
            }}
            style={[prepareLessonStyles.lessonContinueButton, { marginRight: 8, paddingHorizontal: 20 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="replay" size={18} color="#fff" />
              <Text style={[prepareLessonStyles.lessonContinueButtonText, { marginLeft: 8 }]}>Review</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[prepareLessonStyles.lessonContinueButton, { backgroundColor: '#6B7280', paddingHorizontal: 20 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="close" size={18} color="#fff" />
              <Text style={[prepareLessonStyles.lessonContinueButtonText, { marginLeft: 8 }]}>Close</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Renders screen based on type
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
        return <ChecklistScreen content={currentScreen.content} pageId={currentScreen.id} />;
      case 'quiz':
        return <QuizScreen content={currentScreen.content} />;
      default:
        return <LessonScreen content={currentScreen.content} />;
    }
  };

  // Render main component
  return (
    <>
      <StatusBar backgroundColor="colors.light" barStyle="dark-content" />
      <SafeAreaView style={prepareLessonStyles.lessonSafeArea}>
        <View style={prepareLessonStyles.lessonContainer}>
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
                  {index === currentScreenIndex && (
                    <Text numberOfLines={1} ellipsizeMode="tail" style={[
                      prepareLessonStyles.lessonMenuItemText,
                      prepareLessonStyles.lessonMenuItemTextActive,
                      { marginLeft: 8, maxWidth: screenWidth * 0.55 }
                    ]}>
                      {index + 1}. {screen.title}
                    </Text>
                  )}
                </TouchableOpacity>
             ))}
            </HScrollView>
          </View>
          <View style={prepareLessonStyles.lessonContentArea}>
            {renderCurrentScreen()}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default PrepareLessons;