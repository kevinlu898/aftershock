import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { useRef } from "react";
import { cn } from "../../lib/utils";
import { useModalAccessibility } from "../../hooks/useModalAccessibility";
import { useReduceMotion } from "../../hooks/useReduceMotion";
import { Button } from "./button";
import { Text } from "./text";

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  dirty = false,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  submitting = false,
  children,
  contentClassName,
  maxHeightRatio = 0.78,
}) {
  const { height } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const titleRef = useRef(null);
  useModalAccessibility(open, { title, focusRef: titleRef });

  const requestClose = () => {
    if (!dirty) {
      onOpenChange(false);
      return;
    }
    Alert.alert(
      "Discard changes?",
      "Your edits on this screen have not been saved.",
      [
        { text: "Keep editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => onOpenChange(false),
        },
      ]
    );
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType={reduceMotion ? "none" : "slide"}
      onRequestClose={requestClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            accessibilityViewIsModal
            className={cn(
              "rounded-t-2xl border border-border bg-card px-5 pb-6 pt-3",
              contentClassName
            )}
            style={{
              maxHeight: Math.round(height * maxHeightRatio),
              borderCurve: "continuous",
            }}
          >
            <View className="mb-4 h-1.5 w-10 self-center rounded-full bg-border" />

            {title ? (
              <View className="mb-5 gap-1">
                <Text
                  ref={titleRef}
                  accessible
                  role="heading"
                  aria-level={2}
                  className="text-title font-extrabold text-foreground"
                >
                  {title}
                </Text>
                {description ? (
                  <Text className="text-body-sm text-muted-foreground">
                    {description}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="gap-4"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {onSubmit ? (
              <View className="mt-6 flex-row gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onPress={requestClose}
                  disabled={submitting}
                >
                  <Text className="font-bold text-secondary-foreground">
                    {cancelLabel}
                  </Text>
                </Button>
                <Button
                  className="flex-1"
                  onPress={onSubmit}
                  loading={submitting}
                >
                  <Text className="font-bold text-primary-foreground">
                    {submitLabel}
                  </Text>
                </Button>
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default FormSheet;
