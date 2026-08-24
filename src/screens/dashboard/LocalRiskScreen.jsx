import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform, RefreshControl, ScrollView, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { AppIcon } from "../../components/app-icon";
import {
  ErrorState,
  PageHeader,
  Screen,
} from "../../components/app-ui";
import { Card } from "../../components/ui/card";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { Text } from "../../components/ui/text";
import { useRefresh } from "../../hooks/useRefresh";
import { fetchEarthquakeData } from "../../lib/api";
import { formatCachedAt, readCache, writeCache } from "../../lib/cache";
import { getRisk } from "../../lib/storage/storageUtils";
import { useTheme } from "../../lib/theme";

const CACHE_KEY = "local-risk";
const DEFAULT_POSTAL_CODE = 95425;

const formatRiskData = (data) => {
  try {
    if (typeof data === "string") {
      let s = data;
      if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
      return s.replace(/\\n/g, "\n");
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

function DetailRow({ label, value }) {
  return (
    <View className="mb-2.5 flex-row items-center justify-between gap-3">
      <Text className="text-body-sm text-muted-foreground">{label}</Text>
      <Text
        selectable
        className="text-body font-bold text-secondary-foreground"
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function LocalRisk() {
  const { palette } = useTheme();
  const [earthquakeData, setEarthquakeData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cachedAt, setCachedAt] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);

  const load = useCallback(async () => {
    try {
      const rawPostal = await AsyncStorage.getItem("postalcode");
      const postalCode = Number(rawPostal) || DEFAULT_POSTAL_CODE;
      const data = await fetchEarthquakeData(postalCode);
      const latest = data.results?.[0] || null;
      const risk = await getRisk(postalCode);

      setEarthquakeData(latest);
      setRiskData(risk);
      setError(null);
      setCachedAt(null);
      writeCache(CACHE_KEY, { latest, risk });
    } catch (fetchError) {
      console.warn("Error fetching earthquake data", fetchError);
      const cached = await readCache(CACHE_KEY);
      if (cached?.value) {
        setEarthquakeData(cached.value.latest || null);
        setRiskData(cached.value.risk || null);
        setCachedAt(cached.cachedAt);
        setError(null);
      } else {
        setError(fetchError?.message || String(fetchError));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) {
    return showSkeleton ? (
      <ScreenSkeleton cards={2} />
    ) : (
      <View className="flex-1 bg-background" />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Local risk is unavailable"
        description="We could not load current earthquake information. Check your connection and try again."
        onRetry={load}
      />
    );
  }

  const place = earthquakeData?.place;
  const mag = earthquakeData?.mag;
  const time = earthquakeData?.timeISO;
  const depth = earthquakeData?.depth;

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="grow"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      >
        <View className="flex-1 gap-5 p-5">
          <PageHeader title="Local risk snapshot" />

          {cachedAt ? (
            <View className="flex-row items-center gap-2 rounded-xl bg-muted px-3 py-2">
              <AppIcon name="wifi-off" size={14} className="text-muted-foreground" />
              <Text className="text-footnote text-muted-foreground">
                Saved data from {formatCachedAt(cachedAt)}. Pull down to retry.
              </Text>
            </View>
          ) : null}

          <Card>
            <Text className="text-title-sm font-bold text-foreground">
              {place ?? "No recent events"}
            </Text>
            <DetailRow label="Magnitude" value={mag ?? "Not available"} />
            <DetailRow
              label="Depth"
              value={depth != null ? `${depth} km` : "Not available"}
            />
            <DetailRow
              label="Time"
              value={time ? new Date(time).toLocaleString() : "Not available"}
            />
          </Card>

          {riskData ? (
            <Card>
              <Text className="mb-2 font-bold text-secondary-foreground">
                Local risk data
              </Text>
              <ScrollView className="max-h-[300px]" nestedScrollEnabled>
                <Markdown
                  style={{
                    body: {
                      color: palette.foreground,
                      fontFamily:
                        Platform.OS === "ios" ? "Menlo" : "monospace",
                      fontSize: 13,
                    },
                  }}
                >
                  {formatRiskData(riskData)}
                </Markdown>
              </ScrollView>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
