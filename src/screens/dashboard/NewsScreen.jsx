import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, ScrollView, StatusBar, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchNews } from "../../lib/api";
export default function News({
  navigation
}) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top || 20;
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
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);
  if (loading) return <ActivityIndicator className="mt-[24px]" color={"#25745A"} />;
  return <View className="flex-1 bg-background" style={{
    paddingTop: topPadding
  }}>
      
      <ScrollView contentContainerClassName={"grow"} showsVerticalScrollIndicator={false}>
        <View className={"flex-1 p-[18px] pt-[28px]"}>
          <Button unstyled onPress={() => navigation?.goBack?.()} className={"mb-[12px] self-start py-[8px] px-[12px] rounded-[12px] bg-card border border-border"}>
            <Text className={"text-primary font-bold"}>{"← Back"}</Text>
          </Button>
          <Text className={"text-[20px] font-bold text-secondary-foreground mb-[12px]"}>Earthquake News</Text>
          <Text className={"text-muted-foreground mb-[12px]"}>{formattedDate}</Text>
          {news.length === 0 && <Text className={"text-muted-foreground"}>No news available.</Text>}
          <Text className={"text-secondary-foreground mb-[12px]"}>
            Your feed of relevant earthquake news worldwide.
          </Text>
          {news.map((story, idx) => <View key={story.id ?? story.title ?? idx} className={"bg-card p-[18px] rounded-[18px] mb-[14px] shadow-sm border border-border"}>
              <Text className={"text-[18px] font-extrabold text-primary mb-[8px]"}>{story.title}</Text>
              {story.summary ? <Text className={"text-[14px] text-muted-foreground leading-[20px]"}>{story.summary}</Text> : null}
              {!story.summary && story.description ? <Text className={"text-[14px] text-muted-foreground leading-[20px]"}>{story.description}</Text> : null}
              {story.url ? <Button unstyled onPress={async () => {
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
          }} className={"mt-[12px] bg-primary py-[10px] rounded-[12px] items-center"}>
                  <Text className={"text-primary-foreground font-bold"}>Read more</Text>
                </Button> : null}
            </View>)}
        </View>
      </ScrollView>
    </View>;
}
