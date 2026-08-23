import { useEffect, useState } from "react";
import { View } from "react-native";
import { ListRow, SectionCard } from "../../../components/app-ui";
import { APP_ICONS } from "../../../components/app-icon";
import {
  OnboardingHeading,
  OnboardingShell,
} from "../../../components/onboarding/OnboardingShell";
import { ONBOARDING_STEPS } from "../../../lib/onboardingState";
import { getData } from "../../../lib/storage/storageUtils";

const SUBTITLES = {
  location: "Local risk and nearby quakes",
  alerts: "Know the moment it happens",
  contacts: "Reach your people fast",
  medical: "What a paramedic needs",
};

export default function WelcomeStep({ onContinue, onDismiss }) {
  const [firstName, setFirstName] = useState(null);

  useEffect(() => {
    let mounted = true;
    getData("firstname")
      .then((val) => {
        if (mounted && val) setFirstName(val);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <OnboardingShell
      showHeader={false}
      stepIndex={null}
      onCta={onContinue}
      ctaLabel="Let's go"
      secondaryCta={{ label: "I'll do this later", onPress: onDismiss }}
    >
      <OnboardingHeading
        icon="shield-check"
        align="center"
        title={firstName ? `You're in, ${firstName}.` : "You're in."}
        description="Four quick steps in under two minutes."
      />

      <SectionCard className="overflow-hidden p-0">
        {ONBOARDING_STEPS.map((step, index) => (
          <ListRow
            key={step.id}
            icon={APP_ICONS[step.icon]}
            title={step.title}
            subtitle={SUBTITLES[step.id]}
            trailing={false}
            className={index > 0 ? "border-t border-border" : undefined}
          />
        ))}
      </SectionCard>

      <View className="flex-1" />
    </OnboardingShell>
  );
}
