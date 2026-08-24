import { CircleAlert, CircleCheck, Info, X } from "lucide-react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AccessibilityInfo, Platform, Pressable, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  ReduceMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "../../lib/utils";
import haptics from "../../lib/haptics";
import { Icon } from "./icon";
import { Text } from "./text";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 3200;

const TONES = {
  success: {
    icon: CircleCheck,
    container: "border-primary/30 bg-card",
    iconClass: "text-primary",
    haptic: haptics.success,
  },
  error: {
    icon: CircleAlert,
    container: "border-destructive/40 bg-card",
    iconClass: "text-destructive",
    haptic: haptics.error,
  },
  warning: {
    icon: CircleAlert,
    container: "border-warning/40 bg-card",
    iconClass: "text-warning",
    haptic: haptics.warning,
  },
  info: {
    icon: Info,
    container: "border-border bg-card",
    iconClass: "text-primary",
    haptic: haptics.light,
  },
};

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, options = {}) => {
      const {
        tone = "info",
        description,
        duration = DEFAULT_DURATION,
        haptic = true,
      } = typeof options === "string" ? { tone: options } : options;

      const id = ++nextId;
      const toast = { id, message, description, tone };

      setToasts([toast]);

      if (haptic) TONES[tone]?.haptic?.();

      const announcement = description ? `${message}. ${description}` : message;
      AccessibilityInfo.announceForAccessibility?.(announcement);

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration)
        );
      }
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      show,
      dismiss,
      success: (message, options) => show(message, { ...options, tone: "success" }),
      error: (message, options) => show(message, { ...options, tone: "error" }),
      warning: (message, options) => show(message, { ...options, tone: "warning" }),
      info: (message, options) => show(message, { ...options, tone: "info" }),
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  const insets = useSafeAreaInsets();

  if (!toasts.length) return null;

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0 z-[1000] px-4"
      style={{ paddingBottom: insets.bottom + 70 }}
    >
      {toasts.map((toast) => (
        <ToastRow key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

function ToastRow({ toast, onDismiss }) {
  const tone = TONES[toast.tone] || TONES.info;

  return (
    <Animated.View
      entering={FadeInDown.duration(200).reduceMotion(ReduceMotion.System)}
      exiting={FadeOutDown.duration(150).reduceMotion(ReduceMotion.System)}
      pointerEvents="auto"
    >
      <Pressable
        onPress={() => onDismiss(toast.id)}
        accessibilityRole="button"
        accessibilityLabel={`${toast.message}. Dismiss`}
        className={cn(
          "min-h-14 flex-row items-center gap-3 rounded-2xl border px-4 py-3 shadow-overlay active:opacity-90",
          tone.container
        )}
        style={{ borderCurve: "continuous" }}
      >
        <Icon as={tone.icon} size={20} className={tone.iconClass} />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-body-sm font-semibold text-foreground">
            {toast.message}
          </Text>
          {toast.description ? (
            <Text className="text-footnote text-muted-foreground">
              {toast.description}
            </Text>
          ) : null}
        </View>
        <Icon as={X} size={16} className="text-muted-foreground" />
      </Pressable>
    </Animated.View>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    if (__DEV__ && Platform.OS !== "web") {
      console.warn("useToast called outside ToastProvider");
    }
    return {
      show: () => {},
      dismiss: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    };
  }
  return value;
}
