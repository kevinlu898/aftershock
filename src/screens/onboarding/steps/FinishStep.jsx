import { useEffect, useState } from "react";
import { View } from "react-native";
import { ListRow, SectionCard } from "../../../components/app-ui";
import { APP_ICONS } from "../../../components/app-icon";
import {
  OnboardingHeading,
  OnboardingShell,
} from "../../../components/onboarding/OnboardingShell";
import { Progress } from "../../../components/ui/progress";
import { Text } from "../../../components/ui/text";
import {
  ONBOARDING_STEPS,
  STEP_COUNT,
  getOnboardingState,
} from "../../../lib/onboardingState";
import { getData } from "../../../lib/storage/storageUtils";

export default function FinishStep({ onFinish }) {
  const [rows, setRows] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [state, name] = await Promise.all([
        getOnboardingState(),
        getData("firstname").catch(() => null),
      ]);
      if (!mounted) return;

      const resolved = [];
      for (const step of ONBOARDING_STEPS) {
        let done = false;
        try {
          done = await step.hasData(state);
        } catch {
          done = false;
        }
        resolved.push({ ...step, done });
      }
      if (!mounted) return;

      setRows(resolved);
      if (name) setFirstName(String(name));
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const doneCount = rows.filter((r) => r.done).length;

  const finish = async () => {
    setBusy(true);
    await onFinish();
  };

  return (
    <OnboardingShell
      title="Setup complete"
      stepIndex={null}
      onCta={finish}
      ctaLabel="Start preparing"
      ctaLoading={busy}
    >
      <OnboardingHeading
        icon="check-circle"
        align="center"
        title={firstName ? `You're set up, ${firstName}` : "You're set up"}
        description="Your key info is saved. Here's where you stand."
      />

      <SectionCard className="gap-4 p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-secondary-foreground">
            Setup
          </Text>
          <Text
            className="text-lg font-extrabold text-primary"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {`${doneCount} of ${STEP_COUNT}`}
          </Text>
        </View>

        <Progress value={STEP_COUNT ? doneCount / STEP_COUNT : 0} className="h-2" />

        <View className="-mx-5">
          {rows.map((row) => (
            <ListRow
              key={row.id}
              icon={APP_ICONS[row.done ? "check-circle" : "circle-outline"]}
              title={row.title}
              value={row.done ? undefined : "Skipped"}
              trailing={false}
            />
          ))}
        </View>
      </SectionCard>

      <View className="flex-1" />
    </OnboardingShell>
  );
}
