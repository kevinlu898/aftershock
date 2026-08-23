import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon } from "../app-icon";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { useTheme } from "../../lib/theme";


export function OnboardingShell({
  eyebrow = "Setup",
  title,
  stepIndex = null,
  stepCount,
  showHeader = true,
  onBack,
  onSkip,
  skipLabel = "Skip for now",
  children,
  ctaLabel = "Continue",
  ctaDisabled = false,
  ctaLoading = false,
  onCta,
  secondaryCta,
}) {
  const { palette } = useTheme();
  const counted = stepIndex != null;
  const progress = counted ? (stepIndex + 1) / stepCount : 1;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {showHeader ? (
        <View className="border-b border-border bg-card px-4 pb-3 pt-2">
          <View className="min-h-[58px] flex-row items-center gap-3">
            {onBack ? (
              <Button
                unstyled
                className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted active:bg-secondary"
                onPress={onBack}
                accessibilityLabel="Go back one step"
              >
                <AppIcon name="chevron-left" size={22} color={palette.foreground} />
              </Button>
            ) : (
              <View className="h-10 w-10 shrink-0" />
            )}

            <View className="min-w-0 flex-1">
              <Text
                className="text-xs font-semibold text-primary"
                numberOfLines={1}
              >
                {eyebrow}
              </Text>
              <Text
                className="text-[17px] font-bold leading-[22px] text-foreground"
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>

            {counted ? (
              <View className="shrink-0 rounded-full bg-secondary px-3 py-1.5">
                <Text
                  className="text-xs font-bold text-primary"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {`${stepIndex + 1} of ${stepCount}`}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </View>
        </View>
        ) : null}

        <ScrollView
          className="flex-1 bg-background"
          contentContainerClassName="grow gap-6 px-5 py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[560px] flex-1 self-center gap-6">
            {children}
          </View>
        </ScrollView>

        <View className="border-t border-border bg-background px-5 pb-3 pt-3">
          <Button
            className="min-h-[52px] w-full max-w-[560px] self-center rounded-[14px]"
            onPress={() => onCta?.()}
            disabled={ctaDisabled}
            loading={ctaLoading}
          >
            <Text className="text-base font-bold text-primary-foreground">
              {ctaLabel}
            </Text>
            {!ctaDisabled && !ctaLoading ? (
              <AppIcon
                name="chevron-right"
                size={20}
                color={palette.primaryForeground}
              />
            ) : null}
          </Button>

          {onSkip ? (
            <Button
              variant="ghost"
              className="mt-1 min-h-11 self-center"
              onPress={() => onSkip?.()}
            >
              <Text className="text-sm font-semibold text-muted-foreground">
                {skipLabel}
              </Text>
            </Button>
          ) : null}

          {secondaryCta ? (
            <Button
              variant="ghost"
              className="mt-1 min-h-11 self-center"
              onPress={() => secondaryCta.onPress?.()}
            >
              <Text className="text-sm font-semibold text-muted-foreground">
                {secondaryCta.label}
              </Text>
            </Button>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function OnboardingHeading({
  icon,
  title,
  description,
  align = "left",
}) {
  const { palette } = useTheme();
  const centered = align === "center";
  return (
    <View className={centered ? "items-center gap-3" : "gap-3"}>
      {icon ? (
        <View
          className="h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-secondary"
          style={{ borderCurve: "continuous" }}
        >
          <AppIcon name={icon} size={34} color={palette.primary} />
        </View>
      ) : null}
      <View className={centered ? "items-center gap-2" : "gap-2"}>
        <Text
          role="heading"
          aria-level={1}
          className={`text-[26px] font-extrabold leading-[32px] text-foreground${
            centered ? " text-center" : ""
          }`}
        >
          {title}
        </Text>
        {description ? (
          <Text
            className={`text-[15px] leading-[22px] text-muted-foreground${
              centered ? " text-center" : ""
            }`}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default OnboardingShell;
