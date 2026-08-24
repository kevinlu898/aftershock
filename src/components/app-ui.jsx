import {
  ArrowLeft,
  ChevronRight,
  CircleAlert,
  Info,
} from "lucide-react-native";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { cn } from "../lib/utils";
import { useTheme } from "../lib/theme";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Icon } from "./ui/icon";
import { Text } from "./ui/text";

export function IconButton({ className, children, ...props }) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn("rounded-full", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function FormField({
  label,
  description,
  error,
  children,
  className,
}) {
  return (
    <View className={cn("gap-2", className)}>
      {label ? <Label className="text-body-sm font-semibold">{label}</Label> : null}
      {children}
      {error ? (
        <Text
          selectable
          accessibilityLiveRegion="polite"
          role="alert"
          className="text-footnote font-medium text-destructive"
        >
          {error}
        </Text>
      ) : description ? (
        <Text className="text-footnote text-muted-foreground">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function Spinner({ className, ...props }) {
  const { palette } = useTheme();
  return (
    <View className={cn("items-center justify-center p-6", className)}>
      <ActivityIndicator color={palette.primary} {...props} />
    </View>
  );
}

export function Sheet({ children, contentClassName, ...props }) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn(
          "mt-auto max-w-none rounded-b-none rounded-t-2xl border-b-0",
          contentClassName
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

Sheet.Header = DialogHeader;
Sheet.Title = DialogTitle;
Sheet.Description = DialogDescription;
Sheet.Footer = DialogFooter;

export function Screen({ className, children, ...props }) {
  return (
    <View className={cn("flex-1 bg-background", className)} {...props}>
      {children}
    </View>
  );
}

export function ScrollScreen({
  className,
  contentClassName,
  children,
  ...props
}) {
  return (
    <ScrollView
      className={cn("flex-1 bg-background", className)}
      contentContainerClassName={cn(
        "grow gap-6 px-5 py-6",
        contentClassName
      )}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

export function PageHeader({
  title,
  description,
  children,
  className,
  align = "left",
}) {
  const centered = align === "center";
  return (
    <View
      className={cn("gap-2", centered && "items-center", className)}
    >
      <Text
        role="heading"
        aria-level={1}
        className={cn(
          "text-display-lg font-extrabold text-foreground",
          centered && "text-center"
        )}
      >
        {title}
      </Text>
      {description ? (
        <Text
          className={cn(
            "max-w-[560px] text-body-lg text-muted-foreground",
            centered && "text-center"
          )}
        >
          {description}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function BackButton({ onPress, className, ...props }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("min-h-12 -ml-3 self-start", className)}
      onPress={onPress}
      accessibilityLabel="Go back"
      accessibilityHint="Returns to the previous screen"
      hitSlop={8}
      {...props}
    >
      <Icon as={ArrowLeft} size={19} />
      <Text className="font-semibold text-primary">Back</Text>
    </Button>
  );
}

export const SectionCard = Card;

export function SectionHeader({
  title,
  description,
  action,
  className,
}) {
  return (
    <View
      className={cn(
        "flex-row items-end justify-between gap-4",
        className
      )}
    >
      <View className="flex-1 gap-1">
        <Text
          role="heading"
          aria-level={2}
          className="text-title font-bold text-foreground"
        >
          {title}
        </Text>
        {description ? (
          <Text className="text-footnote text-muted-foreground">
            {description}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  destructive = false,
  trailing = true,
  className,
  children,
  ...props
}) {
  const content = (
    <>
      {icon ? (
        <View
          className={cn(
            "h-10 w-10 items-center justify-center rounded-xl bg-secondary",
            destructive && "bg-destructive/10"
          )}
          style={{ borderCurve: "continuous" }}
        >
          <Icon
            as={icon}
            size={20}
            className={destructive ? "text-destructive" : "text-primary"}
          />
        </View>
      ) : null}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          className={cn(
            "text-body-lg font-semibold",
            destructive ? "text-destructive" : "text-foreground"
          )}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={2}
            className="text-footnote text-muted-foreground"
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text className="text-body-sm font-medium text-muted-foreground">
          {value}
        </Text>
      ) : null}
      {children}
      {onPress && trailing ? (
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Button
        unstyled
        onPress={onPress}
        className={cn(
          "min-h-16 flex-row items-center gap-3 px-4 py-3 active:bg-muted",
          className
        )}
        {...props}
      >
        {content}
      </Button>
    );
  }

  return (
    <View
      className={cn("min-h-16 flex-row items-center gap-3 px-4 py-3", className)}
      {...props}
    >
      {content}
    </View>
  );
}

export function StatusCard({
  title,
  description,
  tone = "default",
  icon,
  children,
  className,
}) {
  const isDanger = tone === "danger";
  const isWarning = tone === "warning";
  const ToneIcon = icon || (isDanger ? CircleAlert : isWarning ? CircleAlert : Info);
  return (
    <Card
      className={cn(
        "flex-row items-start gap-4 p-5",
        isDanger && "border-destructive/30 bg-destructive/10",
        isWarning && "border-warning/30 bg-warning/10",
        className
      )}
    >
      <View
        className={cn(
          "h-11 w-11 items-center justify-center rounded-full bg-secondary",
          isDanger && "bg-destructive/15",
          isWarning && "bg-warning/15"
        )}
      >
        <Icon
          as={ToneIcon}
          size={22}
          className={cn(
            "text-primary",
            isDanger && "text-destructive",
            isWarning && "text-warning"
          )}
        />
      </View>
      <View className="flex-1 gap-1.5">
        <Text className="text-body-lg font-bold">{title}</Text>
        {description ? (
          <Text className="text-body-sm text-muted-foreground">
            {description}
          </Text>
        ) : null}
        {children}
      </View>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = "card",
  className,
  children,
}) {
  const Wrapper = variant === "plain" ? View : Card;

  return (
    <Wrapper
      className={cn(
        "items-center gap-3",
        variant === "plain" ? "px-5 py-8" : "px-5 py-10",
        className
      )}
    >
      {icon ? (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Icon as={icon} size={24} className="text-muted-foreground" />
        </View>
      ) : null}
      {title ? (
        <Text className="text-center text-title-sm font-bold">{title}</Text>
      ) : null}
      {description ? (
        <Text className="text-center text-body text-muted-foreground">
          {description}
        </Text>
      ) : null}
      {children}
      {action ? <View className="mt-1">{action}</View> : null}
    </Wrapper>
  );
}

export function LoadingState({ label = "Loading..." }) {
  const { palette } = useTheme();
  return (
    <View
      className="items-center justify-center gap-3 p-8"
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <ActivityIndicator color={palette.primary} />
      <Text className="text-muted-foreground">{label}</Text>
    </View>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
  className,
}) {
  return (
    <View className={cn("flex-1 justify-center bg-background p-5", className)}>
      <StatusCard tone="danger" title={title} description={description}>
        {onRetry ? (
          <Button className="mt-3 self-start" onPress={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </StatusCard>
    </View>
  );
}
