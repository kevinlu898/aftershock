import { useEffect } from "react";
import { AccessibilityInfo, findNodeHandle } from "react-native";

export function useModalAccessibility(open, { title, focusRef } = {}) {
  useEffect(() => {
    if (!open) return undefined;

    const timer = setTimeout(() => {
      const node = focusRef?.current
        ? findNodeHandle(focusRef.current)
        : null;
      if (node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      } else if (title) {
        AccessibilityInfo.announceForAccessibility?.(title);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [open, title, focusRef]);
}

export default useModalAccessibility;
