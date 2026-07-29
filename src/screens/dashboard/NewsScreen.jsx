import { Button } from "../../components/ui/button";
import {
  ScreenSkeleton,
  useDelayedSkeleton,
} from "../../components/ui/skeleton";
import { EmptyState, PageHeader } from "../../components/app-ui";
import { AppIcon } from "../../components/app-icon";
import { Card } from "../../components/ui/card";
import { useEffect, useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { fetchNews } from "../../lib/api";
export default function News({
  navigation
}) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showSkeleton = useDelayedSkeleton(loading);
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const newsData = await fetchNews();
        if (!mounted) return;
        setNews(Array.isArray(newsData) ? newsData : []);
      } catch (e) {
        console.warn("Failed to fetch news", e);
        if (mounted) setError(e?.message || "Unable to load news.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);
  if (loading) {
    return showSkeleton ? <ScreenSkeleton cards={4} /> : <View className="flex-1 bg-background" />;
  }
  return <View className="flex-1 bg-background">
      
      <ScrollView contentContainerClassName={"grow"} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <View className={"flex-1 gap-[16px] p-[20px]"}>
          <PageHeader
            title="News and updates"
            description="Relevant earthquake reporting from around the world."
          />
          <Text className="text-[13px] text-muted-foreground">{formattedDate}</Text>
          {error ? <EmptyState title="News is unavailable" description={error} /> : null}
          {!error && news.length === 0 ? <EmptyState title="No news available" description="Check back soon for the latest earthquake reporting." /> : null}
          {news.map((story, idx) => <Card key={story.id ?? story.title ?? idx}>
              <Text className={"text-[18px] font-extrabold leading-[24px] text-foreground"}>{story.title}</Text>
              {story.summary ? <Text className={"text-[14px] text-muted-foreground leading-[20px]"}>{story.summary}</Text> : null}
              {!story.summary && story.description ? <Text className={"text-[14px] text-muted-foreground leading-[20px]"}>{story.description}</Text> : null}
              {story.url ? <Button variant="outline" onPress={async () => {
            try {
              const supported = await Linking.canOpenURL(story.url);
              if (supported) {
                await Linking.openURL(story.url);
              } else {
                console.warn("Can't open URL:", story.url);
              }
            } catch (e) {
              console.warn("Failed to open URL:", e);
            }
          }} className={"self-start"}>
                  <Text className={"font-bold text-primary"}>Read more</Text>
                  <AppIcon name="external-link" size={17} className="text-primary" />
                </Button> : null}
            </Card>)}
        </View>
      </ScrollView>
    </View>;
}
