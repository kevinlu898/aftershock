import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  FormField,
  LoadingState,
  SectionCard,
  StatusCard,
} from "../../../components/app-ui";
import { AppIcon } from "../../../components/app-icon";
import {
  OnboardingHeading,
  OnboardingShell,
} from "../../../components/onboarding/OnboardingShell";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Text } from "../../../components/ui/text";
import { fetchEarthquakeData } from "../../../lib/api";
import { saveZipToAccount } from "../../../lib/onboardingState";
import { useTheme } from "../../../lib/theme";
import { clearData, getData, storeData } from "../../../lib/storage/storageUtils";

const ZIP_RE = /^\d{5}$/;

/**
 * The /earthquake endpoint returns { results: [{ place, mag, timeISO, depth }] },
 * the same shape LocalRiskScreen reads.
 */
const summarize = (payload) => {
  const event = payload?.results?.[0];
  if (!event) return {};
  return {
    place: event.place ?? null,
    magnitude: event.mag ?? null,
    time: event.timeISO ?? null,
  };
};

export default function LocationStep({
  stepIndex,
  stepCount,
  onBack,
  onSkip,
  onContinue,
}) {
  const { palette } = useTheme();
  const [zip, setZip] = useState("");
  const [initialZip, setInitialZip] = useState("");
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    getData("postalcode")
      .then((val) => {
        if (mounted && val) {
          setZip(String(val));
          setInitialZip(String(val));
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const valid = ZIP_RE.test(zip);
  const revealed = !!result || failed;

  const useMyLocation = async () => {
    setError(null);
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location denied. Enter your ZIP above.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const places = await Location.reverseGeocodeAsync(position.coords);
      const found = places?.find((p) => p.postalCode)?.postalCode;
      if (!found) {
        setError("Couldn't read your ZIP. Enter it above.");
        return;
      }
      setZip(String(found).slice(0, 5));
    } catch {
      setError("Couldn't read your ZIP. Enter it above.");
    } finally {
      setLocating(false);
    }
  };

  const checkArea = async () => {
    if (!valid) return;
    setChecking(true);
    setError(null);
    // getRisk() caches under a single "riskdata" key without regard to the ZIP
    // it was asked about, so a corrected ZIP would otherwise replay the old
    // area's text. Drop the cache whenever the ZIP actually changes.
    if (zip !== initialZip) await clearData("riskdata");
    await storeData("postalcode", zip);
    // Not awaited: the ZIP is already saved locally, and the account mirror
    // should not make the button wait on a round trip.
    saveZipToAccount(zip);
    try {
      // Number, matching how LocalRiskScreen calls the same endpoint.
      const payload = await fetchEarthquakeData(Number(zip));
      setResult(summarize(payload));
    } catch {
      setFailed(true);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <OnboardingShell
        title="Your area"
        stepIndex={stepIndex}
        stepCount={stepCount}
        onBack={onBack}
        onCta={() => {}}
        ctaLabel="Checking"
        ctaLoading
      >
        <LoadingState label={`Reading seismic data for ${zip}`} />
      </OnboardingShell>
    );
  }

  if (revealed) {
    return (
      <OnboardingShell
        title="Your area"
        stepIndex={stepIndex}
        stepCount={stepCount}
        onBack={() => {
          setResult(null);
          setFailed(false);
        }}
        onCta={onContinue}
      >
        {failed ? (
          <StatusCard
            title="We'll check your area shortly"
            description={`Couldn't reach seismic data. ZIP ${zip} is saved.`}
          />
        ) : (
          <>
            <SectionCard className="gap-3 p-5">
              <Text className="text-[13px] text-muted-foreground">
                {`Most recent quake near ${zip}`}
              </Text>
              <Text className="text-[24px] font-extrabold leading-[30px] text-foreground">
                {result?.place || "No recent events on record"}
              </Text>

              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] text-muted-foreground">
                  Magnitude
                </Text>
                <Text
                  className="text-[15px] font-bold text-secondary-foreground"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {result?.magnitude ?? "Not available"}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] text-muted-foreground">When</Text>
                <Text className="text-[15px] font-bold text-secondary-foreground">
                  {result?.time
                    ? new Date(result.time).toLocaleDateString()
                    : "Not available"}
                </Text>
              </View>
            </SectionCard>

            <StatusCard
              tone="warning"
              title="This is why a plan matters"
              description="Households with a plan recover faster. Yours starts next."
            />
          </>
        )}
        <View className="flex-1" />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      title="Your area"
      stepIndex={stepIndex}
      stepCount={stepCount}
      onBack={onBack}
      onSkip={onSkip}
      onCta={checkArea}
      ctaLabel={valid ? "Check my area" : "Enter a 5-digit ZIP code"}
      ctaDisabled={!valid}
    >
      <OnboardingHeading
        icon="map-marker-radius"
        title="Where should we watch?"
        description="Your ZIP code helps us deliver earthquake alerts and assess local risk."
      />

      <FormField
        label="ZIP code"
        error={error}
      >
        <Input
          className="h-12 py-0"
          placeholder="95425"
          value={zip}
          onChangeText={(t) => setZip(t.replace(/\D/g, "").slice(0, 5))}
          keyboardType="number-pad"
          maxLength={5}
          returnKeyType="done"
          onSubmitEditing={checkArea}
        />
      </FormField>

      <Button
        variant="outline"
        className="min-h-12 rounded-xl"
        onPress={useMyLocation}
        loading={locating}
      >
        <AppIcon name="locate-fixed" size={18} color={palette.primary} />
        <Text className="font-semibold text-primary">Use my current location</Text>
      </Button>

      <View className="flex-1" />
    </OnboardingShell>
  );
}
