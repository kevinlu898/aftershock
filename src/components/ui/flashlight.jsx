import { CameraView, useCameraPermissions } from "expo-camera";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { View } from "react-native";

const FlashlightContext = createContext(null);

export function FlashlightProvider({ children }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [on, setOn] = useState(false);

  const toggle = useCallback(async () => {
    if (on) {
      setOn(false);
      return { ok: true };
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result?.granted) {
        return { ok: false, reason: result?.canAskAgain ? "denied" : "blocked" };
      }
    }

    setOn(true);
    return { ok: true };
  }, [on, permission, requestPermission]);

  const value = useMemo(() => ({ on, toggle }), [on, toggle]);

  return (
    <FlashlightContext.Provider value={value}>
      {children}
      <Torch active={on} />
    </FlashlightContext.Provider>
  );
}

function Torch({ active }) {
  if (!active) return null;

  return (
    <View
      className="absolute h-px w-px opacity-0"
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <CameraView style={{ width: 1, height: 1 }} facing="back" enableTorch />
    </View>
  );
}

export function useFlashlight() {
  const value = useContext(FlashlightContext);
  if (!value) {
    return { on: false, toggle: async () => ({ ok: false, reason: "denied" }) };
  }
  return value;
}

export const FLASHLIGHT_FAILURE_MESSAGES = {
  denied: {
    title: "Camera access needed",
    description: "The flashlight uses the camera flash. Allow access to turn it on.",
  },
  blocked: {
    title: "Camera access is off",
    description: "Enable camera access for Aftershock in your device settings.",
  },
};
