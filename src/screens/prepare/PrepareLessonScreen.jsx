import { Button } from "../../components/ui/button";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView as HScrollView, Linking, SafeAreaView, ScrollView, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import ChecklistLessonPage from '../../components/prepare/ChecklistLessonPage';
import { getLessonById, getLessonCurrentPageIndex, getLessonPages, getModuleById } from '../../lib/prepareModules';
import { events, markLessonCompleted, setLessonCurrentPage } from '../../lib/prepareCompletion';
import { useTheme } from '../../lib/theme';
const BUTTON_ROUTE_MAP = {
  'My Plan': 'myPlan',
  'Contact Info': 'contactInfo',
  'Medical Info': 'medicalInfo',
  'Important Documents': 'importantDocuments'
};
const handleButtonPress = (btnText, navigation) => {
  const route = BUTTON_ROUTE_MAP[(btnText || '').trim()] || null;
  if (route) {
    try {
      navigation.navigate(route);
    } catch (e) {
      console.warn('navigate failed', e);
    }
  } else {
    console.warn('No route mapped for button:', btnText);
  }
};

// Render HTML
const SimpleHtmlRenderer = ({
  html = '',
  contentWidth,
  config = {}
}) => {
  if (!html) return null;
  const trimmed = String(html).replace(/\r/g, '').trim();
  const ulRegex = /<ul>([\s\S]*?)<\/ul>/gi;
  let cursor = 0;
  const parts = [];
  let match;
  while ((match = ulRegex.exec(trimmed)) !== null) {
    const start = match.index;
    const before = trimmed.slice(cursor, start);
    if (before.trim()) parts.push({
      type: 'html',
      content: before
    });
    parts.push({
      type: 'ul',
      content: match[1]
    });
    cursor = ulRegex.lastIndex;
  }
  const tail = trimmed.slice(cursor);
  if (tail.trim()) parts.push({
    type: 'html',
    content: tail
  });
  return <View>
            {parts.map((part, idx) => {
      if (part.type === 'ul') {
        const liRegex = /<li>(.*?)<\/li>/gi;
        const items = [];
        let m;
        while ((m = liRegex.exec(part.content)) !== null) items.push(m[1]);
        return <View key={`ul-${idx}`} className="pl-[12px] mb-[12px]">
                            {items.map((it, i) => <Text key={`li-${i}`} style={config.tagsStyles?.li || {
            marginBottom: 8,
            lineHeight: 22
          }}>
                                    {'\u2022 '}{stripTags(it)}
                                </Text>)}
                        </View>;
      }
      const buttonRegex = /<button(?:\s+[^>]*)?>([\s\S]*?)<\/button>/gi;
      const placeholderHtml = part.content.replace(buttonRegex, (s, g1) => `\n__BTN__${g1}__BTN__\n`);
      const cleaned = placeholderHtml.replace(/<h3>(.*?)<\/h3>/gi, (s, g1) => `\n__H3__${g1}__H3__\n`).replace(/<p>(.*?)<\/p>/gi, (s, g1) => `\n${g1}\n`).replace(/<strong>(.*?)<\/strong>/gi, (s, g1) => `**${g1}**`).replace(/<br\/?\s*>/gi, '\n');
      const segments = cleaned.split('\n').map(s => s.trim()).filter(Boolean);
      return <View key={`part-${idx}`} className="mb-[8px]">
                        {segments.map((seg, i) => {
          if (seg.startsWith('__BTN__') && seg.endsWith('__BTN__')) {
            const btnText = seg.replace(/^__BTN__(.*)__BTN__$/i, '$1').trim();
            return <Button unstyled key={`btn-${i}`} activeOpacity={0.87} onPress={() => {
              try {
                if (typeof config.onButton === 'function') config.onButton(btnText);else handleButtonPress(btnText, config.navigation);
              } catch (_e) {}
            }} style={config.buttonStyle || {
              backgroundColor: "#25745A",
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
              shadowOffset: {
                width: 0,
                height: 4
              },
              shadowRadius: 6,
              elevation: 3
            }}>
                                        <Text style={config.buttonTextStyle || {
                color: '#fff',
                fontWeight: '800',
                fontSize: 15
              }}>
                                            {btnText}
                                        </Text>
                                    </Button>;
          }
          if (seg.startsWith('__H3__') && seg.endsWith('__H3__')) {
            const text = seg.replace(/__H3__(.*)__H3__/i, '$1');
            return <Text key={`h3-${i}`} style={config.tagsStyles?.h3 || {
              fontSize: 18,
              fontWeight: '700',
              marginVertical: 8
            }}>{stripTags(text)}</Text>;
          }
          if (seg.includes('**')) {
            const partsBold = seg.split(/\*\*/g);
            return <Text key={`p-${i}`} style={config.tagsStyles?.p || {
              marginBottom: 12
            }}>
                                        {partsBold.map((pb, pi) => pi % 2 === 1 ? <Text key={`b-${pi}`} style={config.tagsStyles?.strong || {
                fontWeight: '700'
              }}>{stripTags(pb)}</Text> : stripTags(pb))}
                                    </Text>;
          }
          return <Text key={`t-${i}`} style={config.tagsStyles?.p || {
            marginBottom: 12
          }}>{stripTags(seg)}</Text>;
        })}
                    </View>;
    })}
        </View>;
};
const stripTags = s => {
  return String(s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
};

// Youtube video
const extractYouTubeId = url => {
  if (!url || typeof url !== 'string') return null;
  const patterns = [/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/, /youtube\.com\/(?:watch\?v=)([A-Za-z0-9_-]{11})/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
};
const getPageContent = page => {
  if (!page) return '';
  if (page.type === 'text') return page.html || page.body || '';
  return page.body;
};

// Main lessons component
const PrepareLessons = ({
  route,
  navigation
}) => {
  const { palette } = useTheme();
  const {
    lessonId = '1-1',
    moduleId = '1',
    lessonData,
    initialPageIndex = 0
  } = route?.params || {};
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [screens, setScreens] = useState([]);
  const [showCompletedView, setShowCompletedView] = useState(false);
  const {
    width: screenWidth
  } = Dimensions.get('window');
  const htmlConfig = {
    tagsStyles: {
      h3: {
        marginBottom: 16,
        fontSize: 20,
        fontWeight: '700'
      },
      p: {
        marginBottom: 12,
        lineHeight: 22
      },
      strong: {
        fontWeight: '700'
      },
      li: {
        marginBottom: 8,
        lineHeight: 22
      }
    }
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
            icon: p.type === 'text' ? 'book-open-variant' : p.type === 'video' ? 'play-circle' : p.type === 'checklist' ? 'checkbox-multiple-marked-circle-outline' : 'checkbox-marked-circle-outline',
            content: p.type === 'text' ? getPageContent(p) : p.type === 'video' ? {
              url: p.videoUrl,
              caption: p.description || p.caption || p.title || ''
            } : p.type === 'checklist' ? p.items : p.questions
          };
        }));
        (async () => {
          const saved = await getLessonCurrentPageIndex(lesson.id);
          const start = saved ?? initialPageIndex ?? 0;
          if (pages.length > 0 && start >= pages.length) {
            setCurrentLesson(prev => prev ? {
              ...prev,
              completed: true
            } : prev);
            setShowCompletedView(true);
          } else {
            setCurrentScreenIndex(start);
            setShowCompletedView(false);
          }
        })();
        const off = events.on('changed', state => {
          try {
            const moduleState = state?.modules?.[module?.id]?.lessons?.[lesson.id];
            if (moduleState) {
              setCurrentLesson(prev => prev ? {
                ...prev,
                completed: !!moduleState.completed
              } : prev);
              setCurrentModule(prev => prev ? {
                ...prev,
                completed: !!state.modules[module.id]?.completed
              } : prev);
            }
          } catch (_error) {
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
  }, [lessonId, lessonData, moduleId, initialPageIndex, navigation]);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuRef.current) return;
    const screenWidth = Dimensions.get('window').width;
    const total = screens.length;
    const itemFull = 110 + 12;
    const compact = 44 + 12;
    const pos = currentScreenIndex * compact;
    if (currentScreenIndex === 0) {
      try {
        menuRef.current.scrollTo({
          x: 0,
          y: 0,
          animated: true
        });
      } catch (_error) {}
      return;
    }
    if (currentScreenIndex === total - 1) {
      const estimatedTotalWidth = itemFull + compact * (total - 1);
      const offsetRight = Math.max(0, estimatedTotalWidth - screenWidth + 24);
      try {
        menuRef.current.scrollTo({
          x: offsetRight,
          y: 0,
          animated: true
        });
      } catch (_error) {}
      return;
    }
    const centerOffset = pos - screenWidth / 2 + itemFull / 2;
    try {
      menuRef.current.scrollTo({
        x: Math.max(0, centerOffset),
        y: 0,
        animated: true
      });
    } catch (_error) {}
  }, [currentScreenIndex, screens.length]);
  const progress = screens.length > 0 ? (currentScreenIndex + 1) / screens.length : 0;
  if (!currentLesson) {
    return <View className={"flex-1 justify-center items-center bg-background"}>
        <MaterialCommunityIcons name="loading" size={40} color={palette.primary} />
        <Text className={"mt-[16px] text-base text-muted-foreground"}>Loading lesson...</Text>
      </View>;
  }
  if (screens.length === 0) {
    return <SafeAreaView className={"flex-1 bg-background"}>
        <View className={["flex-1 bg-background", "justify-center items-center"].filter(Boolean).join(" ")}>
          <Text className={"mt-[16px] text-base text-muted-foreground"}>No content available for this lesson.</Text>
          <Button unstyled onPress={() => navigation.goBack()} className="mt-[16px]">
            <Text className="text-primary">Go back</Text>
          </Button>
        </View>
      </SafeAreaView>;
  }

  // Move between screens and mark progress
  const markScreenComplete = async () => {
    if (currentScreenIndex < screens.length - 1) {
      const next = currentScreenIndex + 1;
      setCurrentScreenIndex(next);
      try {
        await setLessonCurrentPage(currentModule.id, currentLesson.id, next);
      } catch (e) {
        console.warn('prepareLessons: failed to persist page', e);
      }
    } else {
      try {
        await markLessonCompleted(currentModule.id, currentLesson.id);
      } catch (e) {
        console.warn('prepareLessons: error marking lesson complete', e);
      }
      setCurrentLesson(prev => prev ? {
        ...prev,
        completed: true
      } : prev);
      setCurrentModule(prev => prev ? {
        ...prev,
        completed: true
      } : prev);
      setShowCompletedView(true);
    }
  };
  const goToScreen = index => {
    setCurrentScreenIndex(index);
  };

  // Text content
  const LessonScreen = ({
    content
  }) => {
    return <View className={"flex-1 py-[12px] px-[12px]"}>
        <ScrollView className="flex-1" contentContainerClassName="pb-2">
          <View className={"bg-card rounded-[18px] p-[20px] mb-[12px] shadow-sm border border-border max-w-[900px] self-center"}>
            <SimpleHtmlRenderer html={content} contentWidth={screenWidth - 48} config={{
            ...htmlConfig,
            onButton: btnText => {
              if (typeof htmlConfig.onButton === 'function') {
                htmlConfig.onButton(btnText);
              } else {
                handleButtonPress(btnText, navigation);
              }
            },
            navigation
          }} />
          </View>
        </ScrollView>
        <Button unstyled className={"flex-row items-center justify-center bg-primary px-[24px] py-[14px] rounded-[8px] gap-[8px]"} onPress={markScreenComplete}>
          <View className="flex-row items-center justify-center">
            <Text className={"text-primary-foreground text-base font-bold"}>Continue</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={palette.primaryForeground} className="ml-[8px]" />
          </View>
        </Button>
      </View>;
  };

  // Video content
  const VideoScreen = ({
    content
  }) => {
    const videoUrl = content?.url || '';
    const caption = content?.caption || '';
    const videoId = extractYouTubeId(videoUrl);
    const {
      width: screenWidth
    } = Dimensions.get('window');
    const sideMargin = 16;
    const playerWidth = Math.max(0, screenWidth - sideMargin * 2);
    const playerHeight = Math.round(playerWidth * 9 / 16);
    return <View className={"flex-1 py-[12px] px-[12px]"}>
        <ScrollView className="flex-1" contentContainerClassName="pb-2" scrollEnabled={false}>
          <View className="p-[12px] items-center">
            <View className="w-[100%] rounded-[14px] bg-muted p-[8px]">
              <View className={["bg-card rounded-[18px] p-[20px] mb-[12px] shadow-sm border border-border max-w-[900px] self-center", "rounded-[12px] overflow-hidden p-0"].filter(Boolean).join(" ")}>
                <View className="bg-black items-center">
                  {videoId ? <View style={{
                  width: playerWidth,
                  height: playerHeight
                }}>
                      <YoutubePlayer height={playerHeight} play={false} videoId={videoId} />
                    </View> : <Button unstyled onPress={() => Linking.openURL(String(videoUrl))} activeOpacity={0.8}>
                      <View className={["w-[100%] h-[200px] bg-primary rounded-[12px] justify-center items-center mb-[12px]", "rounded-[0px]"].filter(Boolean).join(" ")} style={{
                    width: playerWidth,
                    height: playerHeight
                  }}>
                        <MaterialCommunityIcons name="play" size={48} color={palette.primaryForeground} />
                      </View>
                    </Button>}
                </View>

                {caption ? caption.includes('<') ? <SimpleHtmlRenderer html={caption} contentWidth={screenWidth - 48} config={{
                ...htmlConfig,
                onButton: btnText => {
                  handleButtonPress(btnText, navigation);
                },
                navigation
              }} /> : <Text className={"text-[13px] text-secondary-foreground text-center mt-[6px] p-[5px]"}>{caption}</Text> : null}
              </View>
            </View>
          </View>
        </ScrollView>

        <Button unstyled className={"flex-row items-center justify-center bg-primary px-[24px] py-[14px] rounded-[8px] gap-[8px]"} onPress={markScreenComplete}>
          <View className="flex-row items-center justify-center">
            <Text className={"text-primary-foreground text-base font-bold"}>Continue</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={palette.primaryForeground} className="ml-[8px]" />
          </View>
        </Button>
      </View>;
  };

  // Quiz content
  const QuizScreen = ({
    content
  }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const questions = content || [];
    const currentQ = questions[currentQuestion];
    const handleAnswerSelect = (questionId, answerIndex) => {
      setUserAnswers({
        ...userAnswers,
        [questionId]: answerIndex
      });
    };
    const handleNextQuestion = () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
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
      return {
        correct,
        total: questions.length
      };
    };
    if (showResults) {
      const {
        correct,
        total
      } = calculateScore();
      const passed = correct >= total * 0.7;
      return <View className={"flex-1 py-[12px] px-[12px]"}>
          <View className={"bg-card rounded-[18px] p-[20px] mb-[12px] shadow-sm border border-border max-w-[900px] self-center"}>
            <MaterialCommunityIcons name={passed ? 'trophy' : 'alert-circle'} size={48} color={passed ? palette.warning : palette.destructive} className={"self-center mb-[16px]"} />
            <Text className={"text-[20px] font-bold text-center mb-[12px] text-secondary-foreground"}>
              {passed ? 'Quiz Passed! 🎉' : 'Quiz Results'}
            </Text>
            <Text className={"text-base font-semibold text-primary text-center mb-[8px]"}>
              {correct} out of {total} correct
            </Text>
            <Text className={"text-base text-secondary-foreground text-center leading-[22px]"}>
              {passed ? 'Great job! You understand the key concepts.' : 'Review the material and try again.'}
            </Text>
          </View>
          <Button unstyled className={"flex-row items-center justify-center bg-primary px-[24px] py-[14px] rounded-[8px] gap-[8px]"} onPress={passed ? () => {
          markScreenComplete();
        } : () => {
          setShowResults(false);
          setCurrentQuestion(0);
          setUserAnswers({});
        }}>
            <Text className={"text-primary-foreground text-base font-bold"}>
              {passed ? 'Continue' : 'Try Again'}
            </Text>
            {passed && <MaterialCommunityIcons name="chevron-right" size={20} color={palette.primaryForeground} />}
          </Button>
        </View>;
    }
    return <View className={"flex-1 py-[12px] px-[12px]"}>
        <ScrollView className="flex-1" contentContainerClassName="pb-2">
          <View className={"bg-card rounded-[18px] p-[20px] mb-[12px] shadow-sm border border-border max-w-[900px] self-center"}>
            <View className={"mb-[20px]"}>
              <Text className={"text-base text-secondary-foreground mb-[6px] font-medium"}>
                Question {currentQuestion + 1} of {questions.length}
              </Text>
              <View className={"h-[4px] bg-muted rounded-[2px] overflow-hidden"}>
                <View className={["h-[100%] bg-primary rounded-[2px]"].filter(Boolean).join(" ")} style={{
                width: `${(currentQuestion + 1) / questions.length * 100}%`
              }} />
              </View>
            </View>
            <Text className={"text-base font-semibold text-secondary-foreground text-center mb-[20px] leading-[26px]"}>{currentQ?.question}</Text>

            <View className={"gap-[12px]"}>
              {currentQ?.options?.map((option, index) => <Button unstyled key={index} className={["flex-row items-center p-[16px] bg-card rounded-[12px] border-[2px] border-border", userAnswers[currentQ.id] === index && "bg-secondary border-primary"].filter(Boolean).join(" ")} onPress={() => handleAnswerSelect(currentQ.id, index)}>
                  <View className={["w-[32px] h-[32px] rounded-[16px] bg-muted justify-center items-center mr-[12px] border-[2px] border-border", userAnswers[currentQ.id] === index && "bg-primary border-primary"].filter(Boolean).join(" ")}>
                    <Text className={"text-base font-bold text-secondary-foreground"}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text className={["text-[15px] text-secondary-foreground flex-1 leading-[20px]", userAnswers[currentQ.id] === index && "text-primary font-semibold"].filter(Boolean).join(" ")}>
                    {option}
                  </Text>
                </Button>)}
            </View>
          </View>
        </ScrollView>

        <Button unstyled className={["flex-row items-center justify-center bg-primary px-[24px] py-[14px] rounded-[8px] gap-[8px]", userAnswers[currentQ.id] === undefined && "bg-muted"].filter(Boolean).join(" ")} onPress={handleNextQuestion} disabled={userAnswers[currentQ.id] === undefined}>
          <View className="flex-row items-center justify-center">
            <Text className={"text-primary-foreground text-base font-bold"}>
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={palette.primaryForeground} className="ml-[8px]" />
          </View>
        </Button>
      </View>;
  };

  // Complete screen
  const CompletedScreen = () => <View className={"flex-1 py-[12px] px-[12px]"}>
      <View className={"bg-card rounded-[18px] p-[20px] mb-[12px] shadow-sm border border-border max-w-[900px] self-center"}>
        <MaterialCommunityIcons name="check-circle" size={64} color={palette.primary} className="self-center mb-[12px]" />
        <Text className={["text-[18px] font-bold text-secondary-foreground leading-[22px]", "text-center mb-[8px]"].filter(Boolean).join(" ")}>Lesson Complete</Text>
        <Text className="text-center text-muted-foreground mb-[16px]">You have completed this lesson. Would you like to review it?</Text>

        <View className="flex-row justify-center">
          <Button unstyled onPress={() => {
          setShowCompletedView(false);
          setCurrentScreenIndex(0);
          setLessonCurrentPage(currentModule.id, currentLesson.id, 0).catch(() => {});
        }} className={["flex-row items-center justify-center bg-primary px-[24px] py-[14px] rounded-[8px] gap-[8px]", "mr-[8px] px-[20px]"].filter(Boolean).join(" ")}>
            <View className="flex-row items-center justify-center">
              <MaterialCommunityIcons name="replay" size={18} color={palette.primaryForeground} />
              <Text className={["text-primary-foreground text-base font-bold", "ml-[8px]"].filter(Boolean).join(" ")}>Review</Text>
            </View>
          </Button>

          <Button unstyled onPress={() => navigation.goBack()} className={["flex-row items-center justify-center bg-primary px-[24px] py-[14px] rounded-[8px] gap-[8px]", "bg-muted-foreground px-[20px]"].filter(Boolean).join(" ")}>
            <View className="flex-row items-center justify-center">
              <MaterialCommunityIcons name="close" size={18} color={palette.primaryForeground} />
              <Text className={["text-primary-foreground text-base font-bold", "ml-[8px]"].filter(Boolean).join(" ")}>Close</Text>
            </View>
          </Button>
        </View>
      </View>
    </View>;

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
        return <ChecklistLessonPage content={currentScreen.content} lessonId={currentLesson.id} moduleId={currentModule.id} onContinue={markScreenComplete} pageId={currentScreen.id} />;
      case 'quiz':
        return <QuizScreen content={currentScreen.content} />;
      default:
        return <LessonScreen content={currentScreen.content} />;
    }
  };

  // Render main component
  return <>
      
      <SafeAreaView className={"flex-1 bg-background"}>
        <View className={"flex-1 bg-background"}>
          <View className={"flex-row items-center bg-card px-[16px] py-[12px] border-b border-border shadow-sm min-h-[68px]"}>
            <View className={"items-center mr-[16px] w-[60px]"}>
              <Button unstyled className={"w-[44px] h-[44px] justify-center items-center rounded-[22px] mb-[4px]"} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="chevron-left" size={24} color={palette.primary} />
              </Button>
              <View className={"items-center"}>
                <Text className={"text-[12px] font-semibold text-primary"}>{Math.round(progress * 100)}%</Text>
              </View>
            </View>
            
            <View className={"flex-1 justify-center"}>
              <Text className={"text-[14px] text-primary font-medium mb-[2px]"} numberOfLines={1}>
                {currentModule?.title || 'Module'}
              </Text>
              <Text className={"text-[18px] font-bold text-secondary-foreground leading-[22px]"} numberOfLines={2}>
                {currentLesson?.title}
              </Text>
            </View>
          </View>

          <View className={"bg-card border-b border-border py-[6px] px-[8px] shadow-sm"}>
            <HScrollView ref={menuRef} horizontal showsHorizontalScrollIndicator={false} className={""} contentContainerClassName="px-[6px]">
              {screens.map((screen, index) => <Button unstyled key={screen.id || index} className={index === currentScreenIndex ? "flex-row items-center px-[10px] py-[6px] mx-[6px] rounded-[18px] bg-primary border border-primary min-w-[110px]" : "w-[36px] h-[36px] justify-center items-center mx-[6px] rounded-[18px] bg-card border border-border p-0"} onPress={() => goToScreen(index)}>
                  <MaterialCommunityIcons name={screen.icon} size={18} color={index === currentScreenIndex ? palette.primaryForeground : palette.mutedForeground} />
                  {index === currentScreenIndex && <Text numberOfLines={1} ellipsizeMode="tail" className={["text-[13px] font-semibold text-secondary-foreground", "text-primary-foreground", "ml-[8px]"].filter(Boolean).join(" ")} style={{
                maxWidth: screenWidth * 0.55
              }}>
                      {index + 1}. {screen.title}
                    </Text>}
                </Button>)}
            </HScrollView>
          </View>
          <View className={"flex-1 bg-background"}>
            {renderCurrentScreen()}
          </View>
        </View>
      </SafeAreaView>
    </>;
};
export default PrepareLessons;
