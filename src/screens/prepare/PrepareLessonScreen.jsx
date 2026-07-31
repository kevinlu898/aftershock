import { Button } from "../../components/ui/button";
import { AppIcon } from "../../components/app-icon";
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
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

const decodeHtml = s => String(s || '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');

const stripTags = s => decodeHtml(String(s || '').replace(/<[^>]*>/g, '')).trim();

const RichInlineText = ({ html, style, strongStyle }) => {
  const parts = String(html || '').split(/(<strong>.*?<\/strong>)/gi);
  return <Text style={style}>
      {parts.map((part, index) => {
      const strong = /^<strong>.*<\/strong>$/i.test(part);
      const value = decodeHtml(part.replace(/<[^>]*>/g, ''));
      return strong ? <Text key={index} style={strongStyle}>{value}</Text> : value;
    })}
    </Text>;
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
  return <View style={{ gap: 6 }}>
            {parts.map((part, idx) => {
      if (part.type === 'ul') {
        const liRegex = /<li>(.*?)<\/li>/gi;
        const items = [];
        let m;
        while ((m = liRegex.exec(part.content)) !== null) items.push(m[1]);
        return <View key={`ul-${idx}`} style={{ gap: 10, paddingBottom: 12 }}>
                            {items.map((it, i) => <View key={`li-${i}`} style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            backgroundColor: config.listBackground,
            borderRadius: 14,
            borderCurve: 'continuous',
            paddingHorizontal: 14,
            paddingVertical: 12
          }}>
                                  <View style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: config.accentColor,
              marginTop: 8
            }} />
                                  <RichInlineText
                                    html={it}
                                    style={config.tagsStyles?.li}
                                    strongStyle={config.tagsStyles?.strong}
                                  />
                                </View>)}
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
            }}
              className="mt-3 min-h-[52px] w-full flex-row items-center justify-between rounded-[14px] bg-primary px-4 py-3 active:bg-primary/90"
              style={[{ borderCurve: 'continuous' }, config.buttonStyle]}
            >
                                        <Text
                                          className="text-base font-bold text-primary-foreground"
                                          style={config.buttonTextStyle}
                                        >
                                            {btnText}
                                        </Text>
                                        <AppIcon
                                          name="chevron-right"
                                          size={19}
                                          color={config.buttonIconColor || '#FFFFFF'}
                                        />
                                    </Button>;
          }
          if (seg.startsWith('__H3__') && seg.endsWith('__H3__')) {
            const text = seg.replace(/__H3__(.*)__H3__/i, '$1');
            return <Text key={`h3-${i}`} style={config.tagsStyles?.h3 || {
              fontSize: 18,
              fontWeight: '700',
              marginTop: 14,
              marginBottom: 8
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
          return <Text selectable key={`t-${i}`} style={config.tagsStyles?.p || {
            marginBottom: 12
          }}>{stripTags(seg)}</Text>;
        })}
                    </View>;
    })}
        </View>;
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
  const { width: screenWidth } = useWindowDimensions();
  const htmlConfig = {
    accentColor: palette.primary,
    buttonIconColor: palette.primaryForeground,
    listBackground: palette.muted,
    tagsStyles: {
      h3: {
        color: palette.foreground,
        fontSize: 21,
        fontWeight: '700'
      },
      p: {
        color: palette.foreground,
        marginBottom: 10,
        fontSize: 16,
        lineHeight: 25
      },
      strong: {
        color: palette.foreground,
        fontWeight: '700'
      },
      li: {
        color: palette.foreground,
        flex: 1,
        fontSize: 15,
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
            icon: p.type === 'text' ? 'book-open' : p.type === 'video' ? 'play' : p.type === 'checklist' ? 'list-checks' : 'brain',
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
  const progress = screens.length > 0 ? (currentScreenIndex + 1) / screens.length : 0;
  if (!currentLesson) {
    return <View className={"flex-1 justify-center items-center bg-background"}>
        <AppIcon name="loading" size={40} color={palette.primary} />
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

  const ContinueButton = ({ label = "Continue", disabled = false, onPress = markScreenComplete }) => (
    <View className="border-t border-border bg-background px-5 pb-3 pt-3">
      <Button
        className="min-h-[52px] w-full max-w-[720px] self-center rounded-[14px]"
        onPress={onPress}
        disabled={disabled}
      >
        <Text className="text-base font-bold text-primary-foreground">{label}</Text>
        {!disabled ? <AppIcon name="chevron-right" size={20} color={palette.primaryForeground} /> : null}
      </Button>
    </View>
  );

  const PageHeading = ({ icon, title, description }) => (
    <View className="mb-5 flex-row items-start gap-3">
      <View className="h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary" style={{ borderCurve: "continuous" }}>
        <AppIcon name={icon} size={21} color={palette.primary} />
      </View>
      <View className="min-w-0 flex-1 gap-1.5">
        <Text className="text-[26px] font-extrabold leading-[32px] text-foreground">{title}</Text>
        {description ? <Text className="text-[15px] leading-[22px] text-muted-foreground">{description}</Text> : null}
      </View>
    </View>
  );

  // Text content
  const LessonScreen = ({
    content
  }) => {
    const currentPage = screens[currentScreenIndex];
    return <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow px-5 pb-8 pt-6"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[720px] self-center">
            <PageHeading icon={currentPage?.icon || "book-open"} title={currentPage?.title || "Lesson"} />
            <View
              className="rounded-[20px] border border-border bg-card p-5"
              style={{
                borderCurve: "continuous",
                boxShadow: "0 2px 12px rgba(23, 32, 28, 0.05)"
              }}
            >
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
          </View>
        </ScrollView>
        <ContinueButton />
      </View>;
  };

  // Video content
  const VideoScreen = ({
    content
  }) => {
    const videoUrl = content?.url || '';
    const caption = content?.caption || '';
    const videoId = extractYouTubeId(videoUrl);
    const sideMargin = 40;
    const playerWidth = Math.min(720, Math.max(0, screenWidth - sideMargin));
    const playerHeight = Math.round(playerWidth * 9 / 16);
    const currentPage = screens[currentScreenIndex];
    return <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow px-5 pb-8 pt-6"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[720px] self-center">
            <PageHeading
              icon={currentPage?.icon || "play"}
              title={currentPage?.title || "Video"}
              description="Watch this short lesson, then continue when you are ready."
            />
              <View
                className="overflow-hidden rounded-[20px] border border-border bg-card"
                style={{
                  borderCurve: "continuous",
                  boxShadow: "0 2px 12px rgba(23, 32, 28, 0.05)"
                }}
              >
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
                        <AppIcon name="play" size={48} color={palette.primaryForeground} />
                      </View>
                    </Button>}
                </View>

                {caption ? <View className="p-5">{caption.includes('<') ? <SimpleHtmlRenderer html={caption} contentWidth={screenWidth - 48} config={{
                ...htmlConfig,
                onButton: btnText => {
                  handleButtonPress(btnText, navigation);
                },
                navigation
              }} /> : <Text className="text-[15px] leading-[22px] text-muted-foreground">{caption}</Text>}</View> : null}
              </View>
          </View>
        </ScrollView>

        <ContinueButton />
      </View>;
  };

  // Quiz content
  const QuizScreen = ({
    content
  }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [submittedQuestions, setSubmittedQuestions] = useState({});
    const [showResults, setShowResults] = useState(false);
    const questions = content || [];
    const currentQ = questions[currentQuestion];
    const selectedAnswer = currentQ ? userAnswers[currentQ.id] : undefined;
    const hasSelectedAnswer = selectedAnswer !== undefined;
    const hasSubmitted = currentQ
      ? Boolean(submittedQuestions[currentQ.id])
      : false;
    const answerIsCorrect =
      hasSubmitted && selectedAnswer === currentQ?.correctAnswer;
    const handleAnswerSelect = (questionId, answerIndex) => {
      if (submittedQuestions[questionId]) return;
      setUserAnswers({
        ...userAnswers,
        [questionId]: answerIndex
      });
    };
    const handleSubmitAnswer = () => {
      if (!currentQ || !hasSelectedAnswer) return;
      setSubmittedQuestions({
        ...submittedQuestions,
        [currentQ.id]: true
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
      return <ScrollView
        className="flex-1"
        contentContainerClassName="grow justify-center px-5 py-8"
        contentInsetAdjustmentBehavior="automatic"
      >
          <View
            className="w-full max-w-[560px] self-center rounded-[24px] border border-border bg-card p-6"
            style={{
              borderCurve: "continuous",
              boxShadow: "0 4px 18px rgba(23, 32, 28, 0.07)"
            }}
          >
            <View className={[
              "mb-5 h-16 w-16 self-center items-center justify-center rounded-[22px]",
              passed ? "bg-secondary" : "bg-destructive/10"
            ].join(" ")}>
              <AppIcon name={passed ? 'trophy' : 'alert-circle'} size={30} color={passed ? palette.primary : palette.destructive} />
            </View>
            <Text className="mb-2 text-center text-[24px] font-extrabold leading-[30px] text-foreground">
              {passed ? 'Quiz Passed' : 'Quiz Results'}
            </Text>
            <Text
              className="mb-3 text-center text-[32px] font-extrabold text-primary"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {correct} out of {total} correct
            </Text>
            <Text className="text-center text-[15px] leading-[22px] text-muted-foreground">
              {passed ? 'Great job! You understand the key concepts.' : 'Review the material and try again.'}
            </Text>
            <Button className="mt-6 min-h-[52px] rounded-[14px]" onPress={passed ? () => {
          markScreenComplete();
        } : () => {
          setShowResults(false);
          setCurrentQuestion(0);
          setUserAnswers({});
          setSubmittedQuestions({});
        }}>
            <Text className="text-base font-bold text-primary-foreground">{passed ? 'Continue' : 'Try Again'}</Text>
            {passed && <AppIcon name="chevron-right" size={20} color={palette.primaryForeground} />}
          </Button>
          </View>
        </ScrollView>;
    }
    return <ScrollView
      className="flex-1"
      contentContainerClassName="grow px-5 pb-8 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
          <View className="w-full max-w-[640px] self-center">
            <PageHeading
              icon="brain"
              title="Knowledge check"
            />
            <View
              className="rounded-[20px] border border-border bg-card p-5"
              style={{
                borderCurve: "continuous",
                boxShadow: "0 2px 12px rgba(23, 32, 28, 0.05)"
              }}
            >
              <View className="mb-6 gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[13px] font-semibold text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </Text>
                  <Text
                    className="text-[13px] font-semibold text-primary"
                    style={{ fontVariant: ["tabular-nums"] }}
                  >
                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                  </Text>
                </View>
                <View className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <View className="h-full rounded-full bg-primary" style={{
                  width: `${(currentQuestion + 1) / questions.length * 100}%`
                }} />
                </View>
              </View>
              <Text className="mb-5 text-[19px] font-bold leading-[27px] text-foreground">{currentQ?.question}</Text>

              <View className="gap-3">
                {currentQ?.options?.map((option, index) => {
                  const selected = selectedAnswer === index;
                  const correctOption =
                    hasSubmitted && index === currentQ.correctAnswer;
                  const selectedIncorrect =
                    hasSubmitted && selected && !correctOption;
                  const selectedPending =
                    selected && !hasSubmitted;
                  const optionColors = selectedIncorrect
                    ? {
                        backgroundColor: `${palette.destructive}14`,
                        borderColor: palette.destructive
                      }
                    : correctOption || selectedPending
                      ? {
                          backgroundColor: palette.secondary,
                          borderColor: palette.primary
                        }
                      : {
                          backgroundColor: palette.card,
                          borderColor: palette.border
                        };
                  const markerBackground = selectedIncorrect
                    ? palette.destructive
                    : correctOption || selectedPending
                      ? palette.primary
                      : palette.muted;
                  const optionTextColor = selectedIncorrect
                    ? palette.destructive
                    : correctOption || selectedPending
                      ? palette.primary
                      : palette.foreground;
                  return <Button
                    unstyled
                    key={index}
                    className="w-full min-h-[64px] flex-row items-center gap-3 rounded-[15px] border p-3.5 active:opacity-90"
                    style={{
                      borderCurve: "continuous",
                      ...optionColors
                    }}
                    onPress={() => handleAnswerSelect(currentQ.id, index)}
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${option}${correctOption ? ", correct answer" : selectedIncorrect ? ", incorrect answer" : ""}`}
                  >
                  <View
                    className="h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: markerBackground }}
                  >
                    {correctOption || selectedIncorrect ? <AppIcon
                      name={correctOption ? "check" : "close"}
                      size={17}
                      color={selectedIncorrect ? palette.destructiveForeground : palette.primaryForeground}
                    /> : <Text
                      className="text-sm font-bold"
                      style={{
                        color: selectedPending
                          ? palette.primaryForeground
                          : palette.mutedForeground
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </Text>}
                  </View>
                  <Text
                    className={[
                      "min-w-0 flex-1 text-[15px] leading-[21px]",
                      (selectedPending || correctOption || selectedIncorrect) &&
                        "font-semibold"
                    ].filter(Boolean).join(" ")}
                    style={{ color: optionTextColor }}
                  >
                    {option}
                  </Text>
                </Button>;
                })}
              </View>

              {hasSubmitted ? <View
                className="mt-5 flex-row items-start gap-3 rounded-[15px] p-4"
                style={{
                  backgroundColor: answerIsCorrect
                    ? palette.secondary
                    : `${palette.destructive}14`
                }}
                accessibilityLiveRegion="polite"
              >
                <View
                  className="h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: answerIsCorrect
                      ? palette.primary
                      : palette.destructive
                  }}
                >
                  <AppIcon
                    name={answerIsCorrect ? "check" : "close"}
                    size={17}
                    color={answerIsCorrect ? palette.primaryForeground : palette.destructiveForeground}
                  />
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className={[
                    "text-[15px] font-bold",
                    answerIsCorrect ? "text-primary" : "text-destructive"
                  ].filter(Boolean).join(" ")}>
                    {answerIsCorrect ? "Correct" : "Not quite"}
                  </Text>
                  <Text className="text-[14px] leading-5 text-foreground">
                    {answerIsCorrect
                      ? "You selected the right answer."
                      : `The correct answer is ${currentQ.options[currentQ.correctAnswer]}.`}
                  </Text>
                </View>
              </View> : null}

              <Button
                className="mt-6 min-h-[52px] rounded-[14px]"
                onPress={hasSubmitted ? handleNextQuestion : handleSubmitAnswer}
                disabled={!hasSelectedAnswer}
              >
            <Text className={"text-primary-foreground text-base font-bold"}>
              {hasSubmitted
                ? currentQuestion < questions.length - 1
                  ? 'Next Question'
                  : 'See Results'
                : 'Submit Answer'}
            </Text>
            <AppIcon
              name={hasSubmitted ? "chevron-right" : "check"}
              size={20}
              color={palette.primaryForeground}
              className="ml-[8px]"
            />
            </Button>
          </View>
          </View>
      </ScrollView>;
  };

  // Complete screen
  const CompletedScreen = () => <View className="flex-1 items-center justify-center px-5 py-8">
      <View
        className="w-full max-w-[540px] rounded-[24px] border border-border bg-card p-7"
        style={{
          borderCurve: "continuous",
          boxShadow: "0 4px 18px rgba(23, 32, 28, 0.07)"
        }}
      >
        <View className="mb-5 h-[72px] w-[72px] self-center items-center justify-center rounded-[24px] bg-secondary">
          <AppIcon name="check-circle" size={38} color={palette.primary} />
        </View>
        <Text className="mb-2 text-center text-[26px] font-extrabold leading-8 text-foreground">Lesson complete</Text>
        <Text className="mb-6 text-center text-[15px] leading-[22px] text-muted-foreground">Nice work! Your progress has been saved and you can review this lesson at any time.</Text>

        <View className="gap-3">
          <Button onPress={() => {
          setShowCompletedView(false);
          setCurrentScreenIndex(0);
          setLessonCurrentPage(currentModule.id, currentLesson.id, 0).catch(() => {});
        }} className="min-h-[52px] rounded-[14px]">
              <AppIcon name="replay" size={18} color={palette.primaryForeground} />
              <Text className="text-base font-bold text-primary-foreground">Review lesson</Text>
          </Button>

          <Button variant="outline" onPress={() => navigation.goBack()} className="min-h-[52px] rounded-[14px]">
              <Text className="text-base font-bold text-primary">Back to learning path</Text>
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
  return <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 bg-background">
        <View className="border-b border-border bg-card px-4 pb-3 pt-2">
          <View className="min-h-[58px] flex-row items-center gap-3">
            <Button
              unstyled
              className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted active:bg-secondary"
              onPress={() => navigation.goBack()}
              accessibilityLabel="Back to learning path"
            >
              <AppIcon name="chevron-left" size={22} color={palette.foreground} />
            </Button>

            <View className="min-w-0 flex-1">
              <Text className="text-xs font-semibold text-primary" numberOfLines={1}>
                {currentModule?.title || 'Module'}
              </Text>
              <Text className="text-[17px] font-bold leading-[22px] text-foreground" numberOfLines={1}>
                {currentLesson?.title}
              </Text>
            </View>

            <View className="rounded-full bg-secondary px-3 py-1.5">
              <Text
                className="text-xs font-bold text-primary"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {showCompletedView ? "Done" : `${currentScreenIndex + 1} of ${screens.length}`}
              </Text>
            </View>
          </View>

          <View className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${showCompletedView ? 100 : progress * 100}%` }}
            />
          </View>

          {!showCompletedView && screens.length > 1 ? (
            <View className="mt-3 flex-row items-center justify-center gap-2">
              {screens.map((screen, index) => {
                const active = index === currentScreenIndex;
                const visited = index < currentScreenIndex;
                return <Button
                  unstyled
                  key={screen.id || index}
                  className={[
                    "h-9 w-9 items-center justify-center rounded-full border border-border bg-background",
                    active && "border-primary bg-primary",
                    visited && !active && "border-primary bg-secondary"
                  ].filter(Boolean).join(" ")}
                  onPress={() => goToScreen(index)}
                  accessibilityLabel={`Open page ${index + 1}: ${screen.title}`}
                  accessibilityState={{ selected: active }}
                >
                  <AppIcon
                    name={visited && !active ? "check" : screen.icon}
                    size={16}
                    color={active ? palette.primaryForeground : visited ? palette.primary : palette.mutedForeground}
                  />
                </Button>;
              })}
            </View>
          ) : null}
        </View>

        <View className="flex-1 bg-background">
          {renderCurrentScreen()}
        </View>
      </View>
    </SafeAreaView>;
};
export default PrepareLessons;
