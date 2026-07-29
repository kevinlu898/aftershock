import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, View } from "react-native";
import { cn } from "../../lib/utils";

export function useDelayedSkeleton(
  loading,
  { delay = 150, minimumDuration = 250 } = {}
) {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    let timer;

    if (loading && !visible) {
      timer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delay);
    } else if (!loading && visible) {
      const elapsed = Date.now() - shownAt.current;
      timer = setTimeout(
        () => setVisible(false),
        Math.max(0, minimumDuration - elapsed)
      );
    }

    return () => clearTimeout(timer);
  }, [delay, loading, minimumDuration, visible]);

  return visible;
}

export function Skeleton({ className, style, ...props }) {
  const opacity = useRef(new Animated.Value(0.55)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.72);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.95,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn("rounded-xl bg-muted", className)}
      style={[{ opacity }, style]}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <View className={cn("gap-2.5", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-3.5",
            index === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ compact = false, className }) {
  return (
    <View
      className={cn(
        "gap-4 rounded-2xl border border-border bg-card p-5",
        className
      )}
      style={{ borderCurve: "continuous" }}
    >
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </View>
      </View>
      {!compact ? <SkeletonText lines={3} /> : null}
    </View>
  );
}

export function SkeletonList({ count = 3, compact = true, className }) {
  return (
    <View className={cn("gap-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} compact={compact} />
      ))}
    </View>
  );
}

export function ScreenSkeleton({ cards = 3, className }) {
  return (
    <View
      accessibilityLabel="Loading page"
      accessibilityRole="progressbar"
      className={cn("flex-1 gap-6 bg-background px-5 py-6", className)}
    >
      <View className="gap-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-4/5" />
      </View>
      <SkeletonCard />
      <SkeletonList count={Math.max(0, cards - 1)} />
    </View>
  );
}
