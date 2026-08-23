import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ListRow, SectionCard } from "../../../components/app-ui";
import { APP_ICONS } from "../../../components/app-icon";
import {
  OnboardingHeading,
  OnboardingShell,
} from "../../../components/onboarding/OnboardingShell";
import { getData } from "../../../lib/storage/storageUtils";

const PROMISES = [
  "Quakes near you",
  "Aftershock warnings",
  "No marketing. Ever.",
];

export default function AlertsStep({
  stepIndex,
  stepCount,
  onBack,
  onSkip,
  onContinue,
}) {
  const [zip, setZip] = useState(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    let mounted = true;
    getData("postalcode")
      .then((val) => {
        if (mounted && val) setZip(String(val));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Only ever fired from the button, never on mount. Asking cold, before the
  // user has seen why, is what gets permissions denied permanently.
  const requestAlerts = async () => {
    setAsking(true);
    let permission = "denied";
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      permission = status === "granted" ? "granted" : "denied";
    } catch {
      permission = "denied";
    } finally {
      setAsking(false);
    }
    // A denial is a valid answer, not an error, so advance either way.
    onContinue({ permission });
  };

  return (
    <OnboardingShell
      title="Alerts"
      stepIndex={stepIndex}
      stepCount={stepCount}
      onBack={onBack}
      onSkip={onSkip}
      skipLabel="Not right now"
      onCta={requestAlerts}
      ctaLabel="Turn on alerts"
      ctaLoading={asking}
    >
      <OnboardingHeading
        icon="bell"
        align="center"
        title="Get told the moment it happens"
        description={`Alerts for significant seismic activity${
          zip ? ` near ${zip}` : " near you"
        }. Nothing else.`}
      />

      <SectionCard className="overflow-hidden p-0">
        {PROMISES.map((promise, index) => (
          <ListRow
            key={promise}
            icon={APP_ICONS["check-circle"]}
            title={promise}
            trailing={false}
            className={index > 0 ? "border-t border-border" : undefined}
          />
        ))}
      </SectionCard>

      <View className="flex-1" />
    </OnboardingShell>
  );
}
