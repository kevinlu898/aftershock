import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import {
  FINISH_INDEX,
  FIRST_STEP_INDEX,
  ONBOARDING_STEPS,
  STEP_COUNT,
  WELCOME_INDEX,
  dismissOnboarding,
  getOnboardingState,
  markOnboardingComplete,
  markStepDone,
  markStepSkipped,
  setCurrentStep,
} from "../../lib/onboardingState";
import AlertsStep from "./steps/AlertsStep";
import ContactsStep from "./steps/ContactsStep";
import FinishStep from "./steps/FinishStep";
import LocationStep from "./steps/LocationStep";
import MedicalStep from "./steps/MedicalStep";
import WelcomeStep from "./steps/WelcomeStep";

const STEP_COMPONENTS = {
  location: LocationStep,
  alerts: AlertsStep,
  contacts: ContactsStep,
  medical: MedicalStep,
};

export default function OnboardingScreen({ navigation, route }) {
  const [index, setIndex] = useState(null);

  // Resume where the user left off. A deep link from the dashboard nudge jumps
  // straight to one step and, once that step is answered, goes to the finish
  // screen rather than marching through the rest.
  const singleStepId = route?.params?.stepId || null;

  useEffect(() => {
    let mounted = true;
    getOnboardingState()
      .then((state) => {
        if (!mounted) return;
        if (state.status === "completed" && !singleStepId) {
          navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
          return;
        }
        if (singleStepId) {
          const found = ONBOARDING_STEPS.findIndex((s) => s.id === singleStepId);
          if (found >= 0) {
            setIndex(found + FIRST_STEP_INDEX);
            return;
          }
        }
        const saved = Number(state.currentStepIndex) || WELCOME_INDEX;
        setIndex(Math.min(Math.max(saved, WELCOME_INDEX), FINISH_INDEX));
      })
      .catch(() => {
        if (mounted) setIndex(WELCOME_INDEX);
      });
    return () => {
      mounted = false;
    };
  }, [navigation, singleStepId]);

  const goTo = useCallback(async (nextIndex) => {
    setIndex(nextIndex);
    await setCurrentStep(nextIndex);
  }, []);

  const advanceFrom = useCallback(
    async (stepIndexInList) => {
      // Deep-linked single-step entry short-circuits to the finish screen.
      if (singleStepId) return goTo(FINISH_INDEX);
      return goTo(stepIndexInList + FIRST_STEP_INDEX + 1);
    },
    [goTo, singleStepId]
  );

  const finish = useCallback(async () => {
    await markOnboardingComplete();
    // Land on the app's home page. Reset rather than navigate so Back cannot
    // re-enter the wizard.
    navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
  }, [navigation]);

  if (index === null) {
    return <View className="flex-1 bg-background" />;
  }

  if (index === WELCOME_INDEX) {
    return (
      <WelcomeStep
        onContinue={() => goTo(FIRST_STEP_INDEX)}
        onDismiss={async () => {
          await dismissOnboarding();
          navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
        }}
      />
    );
  }

  if (index >= FINISH_INDEX) {
    return (
      <FinishStep onFinish={finish} />
    );
  }

  const stepIndexInList = index - FIRST_STEP_INDEX;
  const step = ONBOARDING_STEPS[stepIndexInList];
  const StepComponent = STEP_COMPONENTS[step?.id];
  if (!step || !StepComponent) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <StepComponent
      stepIndex={stepIndexInList}
      stepCount={STEP_COUNT}
      onBack={
        // Deep-linked from the dashboard nudge: back means "leave", not
        // "rewind into a flow the user never entered".
        singleStepId
          ? () => navigation.goBack()
          : () => goTo(Math.max(index - 1, WELCOME_INDEX))
      }
      onSkip={async () => {
        await markStepSkipped(step.id);
        await advanceFrom(stepIndexInList);
      }}
      onContinue={async (extra) => {
        // Only ever persist a plain data patch; anything else is discarded.
        const patch =
          extra && typeof extra === "object" && !extra.nativeEvent ? extra : {};
        await markStepDone(step.id, patch);
        await advanceFrom(stepIndexInList);
      }}
    />
  );
}
