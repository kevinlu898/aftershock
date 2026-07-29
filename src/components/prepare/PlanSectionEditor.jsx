import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { useTheme } from "../../lib/theme";

export default function PlanSectionEditor({
  editorRegistry,
  plan,
  sectionKey,
  title,
  onFocusChange,
  onSave,
  setEditing,
}) {
  const { palette } = useTheme();
  const [localText, setLocalText] = useState(plan[sectionKey] || "");
  const richRef = useRef(null);
  const value = plan[sectionKey] || "";

  useEffect(() => {
    setLocalText(value);
  }, [value]);

  const saveAndSync = useCallback(async () => {
    const next = { ...plan, [sectionKey]: localText };
    next._meta = {
      ...(plan._meta || {}),
      [sectionKey]: new Date().toISOString(),
    };
    await onSave(next);
  }, [localText, onSave, plan, sectionKey]);

  useEffect(() => {
    const registry = editorRegistry.current;
    registry[sectionKey] = {
      saveAndClose: async () => {
        try {
          await richRef.current?.blur();
        } catch (_error) {
          // The editor may already be detached while the section is closing.
        }
        await saveAndSync();
        setEditing((previous) => ({ ...previous, [sectionKey]: false }));
      },
    };

    return () => {
      delete registry[sectionKey];
    };
  }, [editorRegistry, saveAndSync, sectionKey, setEditing]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "position"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
      >
        <View className="mt-2 min-h-[140px] overflow-hidden rounded-xl border border-border bg-card">
          <RichToolbar
            editor={richRef}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.heading1,
              actions.insertLink,
            ]}
            style={{
              backgroundColor: palette.card,
              borderBottomWidth: 1,
              borderBottomColor: palette.border,
              paddingVertical: 6,
              paddingHorizontal: 8,
            }}
          />
          <View className="min-h-[140px] overflow-hidden">
            <RichEditor
              ref={richRef}
              initialContentHTML={localText}
              style={{ minHeight: 140, padding: 10, backgroundColor: palette.card }}
              editorStyle={{
                backgroundColor: palette.card,
                color: palette.foreground,
              }}
              placeholder={`Write your ${title.toLowerCase()}...`}
              onChange={setLocalText}
              onBlur={async () => {
                await saveAndSync();
                onFocusChange(null);
              }}
              onFocus={() => onFocusChange(sectionKey)}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
