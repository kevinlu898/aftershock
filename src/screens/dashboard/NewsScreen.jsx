import { useCallback, useEffect, useState } from "react";
import { Linking, RefreshControl, ScrollView, View } from "react-native";
import { AppIcon } from "../../components/app-icon";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Screen,
} from "../../components/app-ui";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { Text } from "../../components/ui/text";
import { useRefresh } from "../../hooks/useRefresh";
import { fetchNews } from "../../lib/api";
import { formatCachedAt, readCache, writeCache } from "../../lib/cache";
import { useTheme } from "../../lib/theme";

const CACHE_KEY = "news";

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cachedAt, setCachedAt] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const { palette } = useTheme();

  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const load = useCallback(async () => {
    try {
      const newsData = await fetchNews();
      const list = Array.isArray(newsData) ? newsData : [];
      setNews(list);
      setError(null);
      setCachedAt(null);
      writeCache(CACHE_KEY, list);
    } catch (fetchError) {
      console.warn("Failed to fetch news", fetchError);
      const cached = await readCache(CACHE_KEY);
      if (cached?.value?.length) {
        setNews(cached.value);
        setCachedAt(cached.cachedAt);
        setError(null);
      } else {
        setError(fetchError?.message || "Unable to load news.");
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
      <ScreenSkeleton cards={4} />
    ) : (
      <View className="flex-1 bg-background" />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="News is unavailable"
        description={error}
        onRetry={load}
      />
    );
  }

  const openStory = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch (openError) {
      console.warn("Failed to open URL", openError);
    }
  };

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
        <View className="flex-1 gap-4 p-5">
          <PageHeader
            title="News and updates"
            description="Relevant earthquake reporting from around the world."
          />

          {cachedAt ? (
            <View className="flex-row items-center gap-2 rounded-xl bg-muted px-3 py-2">
              <AppIcon name="wifi-off" size={14} className="text-muted-foreground" />
              <Text className="text-footnote text-muted-foreground">
                Showing saved stories from {formatCachedAt(cachedAt)}. Pull down
                to retry.
              </Text>
            </View>
          ) : (
            <Text className="text-footnote text-muted-foreground">
              {formattedDate}
            </Text>
          )}

          {news.length === 0 ? (
            <EmptyState
              title="No news available"
              description="Check back soon for the latest earthquake reporting."
            />
          ) : null}

          {news.map((story, index) => (
            <Card key={story.id ?? story.title ?? index}>
              <Text className="text-title-sm font-extrabold text-foreground">
                {story.title}
              </Text>
              {story.summary || story.description ? (
                <Text className="text-body-sm text-muted-foreground">
                  {story.summary || story.description}
                </Text>
              ) : null}
              {story.url ? (
                <Button
                  variant="outline"
                  onPress={() => openStory(story.url)}
                  className="self-start"
                  accessibilityLabel={`Read more: ${story.title}`}
                  accessibilityHint="Opens the article in your browser"
                >
                  <Text className="font-bold text-primary">Read more</Text>
                  <AppIcon name="external-link" size={17} className="text-primary" />
                </Button>
              ) : null}
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
