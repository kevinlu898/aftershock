import { ActivityIndicator, View } from "react-native";
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
    <View className={cn("mb-4", className)}>
      {label ? <Label>{label}</Label> : null}
      {children}
      {error ? (
        <Text className="mt-1 text-sm font-medium text-destructive">{error}</Text>
      ) : description ? (
        <Text className="mt-1 text-sm text-muted-foreground">{description}</Text>
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

export function PageHeader({ title, description, children, className }) {
  return (
    <View className={cn("mb-6", className)}>
      <Text className="text-center text-3xl font-extrabold text-primary">
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-center text-base leading-6 text-muted-foreground">
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
      variant="outline"
      size="sm"
      className={cn("mb-4 self-start", className)}
      onPress={onPress}
      {...props}
    >
      <Text>← Back</Text>
    </Button>
  );
}

export const SectionCard = Card;

export function EmptyState({ title, description, className, children }) {
  return (
    <Card className={cn("items-center px-5 py-8", className)}>
      <Text className="text-lg font-bold">{title}</Text>
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
