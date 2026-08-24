import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Text } from "../../components/ui/text";
import { useToast } from "../../components/ui/toast";
import { exportData } from "../../lib/api";
import haptics from "../../lib/haptics";

const USAGE_KEY = "export_data_usage";

const DAILY_EXPORT_LIMIT = 4;

const todayKey = () => new Date().toISOString().slice(0, 10);

async function readUsage() {
  const today = todayKey();
  try {
    const raw = await AsyncStorage.getItem(USAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.date === today && typeof parsed.count === "number") {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Failed to read export usage", error);
  }
  return { date: today, count: 0 };
}

async function writeUsage(usage) {
  try {
    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.warn("Failed to write export usage", error);
  }
}

export default function ExportData() {
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const toast = useToast();

  const refreshRemaining = useCallback(async () => {
    const usage = await readUsage();
    setRemaining(Math.max(0, DAILY_EXPORT_LIMIT - usage.count));
  }, []);

  useEffect(() => {
    refreshRemaining();
  }, [refreshRemaining]);

  const handleExport = async () => {
    setLoading(true);
    try {
      const usage = await readUsage();

      if (usage.count >= DAILY_EXPORT_LIMIT) {
        toast.warning("Daily limit reached", {
          description: `You can request an export up to ${DAILY_EXPORT_LIMIT} times per day. Try again tomorrow.`,
        });
        return;
      }

      await writeUsage({ date: usage.date, count: usage.count + 1 });
      setRemaining(Math.max(0, DAILY_EXPORT_LIMIT - (usage.count + 1)));

      try {
        const data = await exportData();
        const message =
          (data && (data.message || data.msg)) || "Export request submitted.";
        haptics.success();
        toast.success("Export requested", { description: String(message) });
      } catch (error) {
        console.warn("Export failed", error);
        await writeUsage({ date: usage.date, count: usage.count });
        setRemaining(Math.max(0, DAILY_EXPORT_LIMIT - usage.count));
        haptics.error();
        toast.error("Export failed", {
          description: error?.message || "Unable to request export.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-5"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View>
        <Card>
          <Text className="text-body-lg text-muted-foreground">
            Send a copy of all your emergency data to your email. It will take a
            few moments to prepare your export.
          </Text>

          {remaining !== null ? (
            <Text className="text-footnote text-muted-foreground">
              {remaining > 0
                ? `${remaining} of ${DAILY_EXPORT_LIMIT} requests left today.`
                : "No requests left today."}
            </Text>
          ) : null}

          <Button
            onPress={handleExport}
            loading={loading}
            disabled={remaining === 0}
          >
            Request Export
          </Button>
        </Card>
      </View>
    </ScrollView>
  );
}
