import { Image } from "expo-image";
import { useRef } from "react";
import { Modal, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModalAccessibility } from "../../hooks/useModalAccessibility";
import { useReduceMotion } from "../../hooks/useReduceMotion";
import { AppIcon } from "../app-icon";
import { Button } from "./button";
import { Text } from "./text";

export function ImageViewer({ visible, uri, title, notes, onClose }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const titleRef = useRef(null);
  useModalAccessibility(visible, { title, focusRef: titleRef });

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-background" accessibilityViewIsModal>
        <View
          className="flex-row items-center gap-3 border-b border-border px-4 pb-3"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="min-w-0 flex-1">
            <Text
              ref={titleRef}
              accessible
              numberOfLines={1}
              role="heading"
              aria-level={1}
              className="text-callout font-bold text-foreground"
            >
              {title || "Document"}
            </Text>
            {notes ? (
              <Text numberOfLines={1} className="text-footnote text-muted-foreground">
                {notes}
              </Text>
            ) : null}
          </View>
          <Button
            unstyled
            className="h-11 w-11 items-center justify-center rounded-full active:bg-muted"
            onPress={onClose}
            accessibilityLabel="Close document"
            hitSlop={8}
          >
            <AppIcon name="close" size={22} className="text-foreground" />
          </Button>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingBottom: insets.bottom,
          }}
          maximumZoomScale={4}
          minimumZoomScale={1}
          centerContent
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {uri ? (
            <Image
              source={{ uri }}
              contentFit="contain"
              style={{ width: "100%", height: "100%", minHeight: 320 }}
              accessibilityLabel={title ? `${title}, full screen` : "Document, full screen"}
            />
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default ImageViewer;
