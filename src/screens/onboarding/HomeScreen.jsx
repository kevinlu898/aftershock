import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Button } from "../../components/ui/button";
import { Text } from "../../components/ui/text";
import { getOnboardingState } from "../../lib/onboardingState";
import { getData } from "../../lib/storage/storageUtils";

const LOGO = require("../../../assets/images/favicon.png");
const SHOT_PLAN = require("../../../assets/images/screenshots/plan.png");
const SHOT_EMERGENCY = require("../../../assets/images/screenshots/emergency.png");
const SHOT_AI = require("../../../assets/images/screenshots/ai.png");

/**
 * Slide 1 introduces the app itself. The rest each show one feature, with a
 * screenshot of the real screen. Drop the files in assets/images/screenshots/
 * and point `screenshot` at them with require().
 */
const SLIDES = [
  {
    id: "what",
    title: "Aftershock",
    body: "Earthquake preparedness for your household. Build a plan, keep the details close, and know what to do when the ground moves.",
    screenshot: null,
    intro: true,
  },
  {
    id: "plan",
    title: "Build your plan",
    body: "Evacuation routes, meeting points, and what to do after the shaking stops.",
    screenshot: SHOT_PLAN,
  },
  {
    id: "emergency",
    title: "All in one place",
    body: "Contacts, medical details, and documents. Ready in seconds, even offline.",
    screenshot: SHOT_EMERGENCY,
  },
  {
    id: "ai",
    title: "Ask Epicenter AI",
    body: "Plain answers on what to do before, during, and after a quake.",
    screenshot: SHOT_AI,
  },
];

export default function Landing() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    let mounted = true;
    // Already signed in? Let the gate decide between the wizard and the app.
    (async () => {
      try {
        const loggedIn = await getData("isLoggedIn");
        if (!mounted || loggedIn !== "yes") return;
        const state = await getOnboardingState();
        if (!mounted) return;
        navigation.replace(
          state.status === "completed" || state.status === "dismissed"
            ? "MainApp"
            : "Onboarding"
        );
      } catch {
        // Stay on the landing page.
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetX = event?.nativeEvent?.contentOffset?.x || 0;
        setActiveDot(
          Math.min(Math.round(offsetX / Math.max(width, 1)), SLIDES.length - 1)
        );
      },
    }
  );

  // Phone-shaped frame for the feature screenshots.
  const shotHeight = Math.round(height * 0.36);
  const shotWidth = Math.round(shotHeight * 0.49);
  const heroSize = Math.min(160, Math.max(110, Math.round(width * 0.34)));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1">
        {/* Brand mark, held steady above the carousel so it shows on every slide. */}
        <View className="flex-row items-center justify-center gap-2 pb-2 pt-2">
          <Image
            source={LOGO}
            style={{ width: 28, height: 28, borderRadius: 8 }}
            resizeMode="cover"
            accessibilityLabel="Aftershock"
          />
          <Text className="text-[17px] font-extrabold text-foreground">
            Aftershock
          </Text>
        </View>

        {/*
          The carousel fills the space between the brand mark and the footer so
          the whole area is swipeable. Sizing it to its content left a dead zone
          below the text where swipes did nothing.
        */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
          className="flex-1"
          contentContainerStyle={{ alignItems: "center" }}
        >
          {SLIDES.map((slide) => (
            <View
              key={slide.id}
              style={{ width }}
              className="items-center justify-center gap-7 px-8"
            >
              {slide.intro ? (
                <Image
                  source={LOGO}
                  style={{
                    width: heroSize,
                    height: heroSize,
                    borderRadius: 32,
                    borderCurve: "continuous",
                  }}
                  resizeMode="cover"
                />
              ) : slide.screenshot ? (
                <Image
                  source={slide.screenshot}
                  style={{
                    width: shotWidth,
                    height: shotHeight,
                    borderRadius: 20,
                    borderCurve: "continuous",
                  }}
                  resizeMode="contain"
                  accessibilityLabel={`${slide.title} screen`}
                />
              ) : null}

              <View className="gap-3">
                <Text
                  role="heading"
                  aria-level={1}
                  className="text-center text-[28px] font-extrabold leading-[34px] text-foreground"
                >
                  {slide.title}
                </Text>
                <Text className="max-w-[560px] text-center text-base leading-6 text-muted-foreground">
                  {slide.body}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="items-center gap-5 px-6 pb-2 pt-4">
          <View className="flex-row items-center justify-center gap-2">
            {SLIDES.map((slide, index) => (
              <View
                key={slide.id}
                className={`h-[8px] rounded-[4px] ${
                  index === activeDot
                    ? "w-[24px] bg-primary"
                    : "w-[8px] bg-muted-foreground/40"
                }`}
              />
            ))}
          </View>

          <View className="w-full items-center gap-2">
            <Button
              onPress={() => navigation.replace("AccountCreation")}
              className="min-h-[52px] w-full max-w-[360px] rounded-[14px]"
            >
              <Text className="text-base font-bold text-primary-foreground">
                Get Started
              </Text>
            </Button>

            <Button
              variant="ghost"
              onPress={() => navigation.navigate("Login")}
              className="w-full max-w-[360px]"
            >
              <Text className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Text className="font-bold text-primary">Log in</Text>
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
