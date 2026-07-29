import {
  ArrowLeft,
  ChevronRight,
  CircleAlert,
  Info,
} from "lucide-react-native";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { cn } from "../lib/utils";
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
      {label ? <Label className="text-sm font-semibold">{label}</Label> : null}
      {children}
      {error ? (
        <Text selectable className="text-[13px] font-medium leading-[18px] text-destructive">
          {error}
        </Text>
      ) : description ? (
        <Text className="text-[13px] leading-[18px] text-muted-foreground">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function Spinner({ className, ...props }) {
  return (
    <View className={cn("items-center justify-center p-6", className)}>
      <ActivityIndicator color="#25745A" {...props} />
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
          "text-[28px] font-extrabold leading-[34px] text-foreground",
          centered && "text-center"
        )}
      >
        {title}
      </Text>
      {description ? (
        <Text
          className={cn(
            "max-w-[560px] text-base leading-6 text-muted-foreground",
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
      className={cn("-ml-3 self-start", className)}
      onPress={onPress}
      accessibilityLabel="Go back"
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
          className="text-xl font-bold leading-6 text-foreground"
        >
          {title}
        </Text>
        {description ? (
          <Text className="text-[13px] leading-[18px] text-muted-foreground">
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
            "text-base font-semibold leading-5",
            destructive ? "text-destructive" : "text-foreground"
          )}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={2}
            className="text-[13px] leading-[18px] text-muted-foreground"
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text className="text-sm font-medium text-muted-foreground">
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
        <Text className="text-base font-bold">{title}</Text>
        {description ? (
          <Text className="text-sm leading-5 text-muted-foreground">
            {description}
          </Text>
        ) : null}
        {children}
      </View>
    </Card>
  );
}

export function EmptyState({ title, description, className, children }) {
  return (
    <Card className={cn("items-center px-5 py-10", className)}>
      <Text className="text-center text-lg font-bold">{title}</Text>
      {description ? (
        <Text className="mt-2 text-center text-muted-foreground">
          {description}
        </Text>
      ) : null}
      {children}
    </Card>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return (
    <View className="items-center justify-center gap-3 p-8">
      <ActivityIndicator color="#25745A" />
      <Text className="text-muted-foreground">{label}</Text>
    </View>
  );
}
