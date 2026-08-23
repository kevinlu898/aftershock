import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { AppIcon } from "../app-icon";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Text } from "../ui/text";
import { useTheme } from "../../lib/theme";
import {
  STEP_COUNT,
  events,
  getOnboardingState,
  getPendingSteps,
  isNudgeSnoozed,
  snoozeNudge,
} from "../../lib/onboardingState";

export function SetupNudgeCard() {
  const navigation = useNavigation();
  const { palette } = useTheme();
  const [pending, setPending] = useState([]);
  const [snoozed, setSnoozed] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [steps, state] = await Promise.all([
        getPendingSteps(),
        getOnboardingState(),
      ]);
      setPending(steps);
      setSnoozed(isNudgeSnoozed(state));
    } catch {
      setPending([]);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Two sources: the store itself, and coming back to this screen after the
    // user satisfied a step somewhere else.
    const off = events.on("changed", refresh);
    const unsub = navigation.addListener?.("focus", refresh);
    return () => {
      off?.();
      unsub?.();
    };
  }, [navigation, refresh]);

  if (snoozed || pending.length === 0) return null;

  const done = STEP_COUNT - pending.length;

  return (
    <Card className="gap-3 p-5">
      <View className="flex-row items-center gap-3">
        <View
          className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary"
          style={{ borderCurve: "continuous" }}
        >
          <AppIcon name="list-checks" size={20} color={palette.primary} />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-base font-bold text-foreground">
            {`Finish setting up: ${done} of ${STEP_COUNT}`}
          </Text>
          <Text className="text-sm leading-5 text-muted-foreground">
            A few minutes now saves time later.
          </Text>
        </View>
      </View>

      <Progress value={STEP_COUNT ? done / STEP_COUNT : 0} className="h-1.5" />

      <View>
        {pending.slice(0, 2).map((step) => (
          <Button
            unstyled
            key={step.id}
            className="min-h-11 flex-row items-center gap-2.5 py-1.5 active:opacity-60"
            onPress={() =>
              step.route
                ? navigation.navigate(step.route)
                : navigation.navigate("Onboarding", { stepId: step.id })
            }
          >
            <AppIcon name={step.icon} size={17} color={palette.primary} />
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 text-[15px] font-semibold text-foreground"
            >
              {step.nudgeTitle}
            </Text>
            <AppIcon
              name="chevron-right"
              size={16}
              color={palette.mutedForeground}
            />
          </Button>
        ))}
      </View>

      <View className="flex-row items-center gap-2">
        <Button
          size="sm"
          className="flex-1"
          onPress={() =>
            navigation.navigate("Onboarding", { stepId: pending[0].id })
          }
        >
          <Text className="font-bold text-primary-foreground">
            Continue setup
          </Text>
        </Button>
        <Button size="sm" variant="ghost" onPress={() => snoozeNudge(7)}>
          <Text className="font-semibold text-muted-foreground">Not now</Text>
        </Button>
      </View>
    </Card>
  );
}

export default SetupNudgeCard;
