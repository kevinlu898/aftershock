import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { Button } from "../ui/button";
import { Text } from "../ui/text";


export function OnboardingSheet({
  visible,
  title,
  onCancel,
  onSubmit,
  submitLabel = "Save",
  submitDisabled = false,
  children,
}) {
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/40">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            className="rounded-t-[28px] border border-border bg-card px-5 pb-6 pt-3"
            style={{
              maxHeight: Math.round(height * 0.78),
              borderCurve: "continuous",
            }}
          >
            <View className="mb-4 h-1.5 w-10 self-center rounded-full bg-border" />

            <Text className="mb-4 text-xl font-bold text-foreground">
              {title}
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-4 pb-2"
            >
              {children}
            </ScrollView>

            <View className="mt-6 flex-row gap-3">
              <Button variant="secondary" className="flex-1" onPress={onCancel}>
                <Text className="font-semibold text-secondary-foreground">
                  Cancel
                </Text>
              </Button>
              <Button
                className="flex-1"
                onPress={onSubmit}
                disabled={submitDisabled}
              >
                <Text className="font-bold text-primary-foreground">
                  {submitLabel}
                </Text>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default OnboardingSheet;
