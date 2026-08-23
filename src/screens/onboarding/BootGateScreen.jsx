import { useEffect } from "react";
import { View } from "react-native";
import { getOnboardingState } from "../../lib/onboardingState";
import { getData } from "../../lib/storage/storageUtils";

/**
 * Decides where a cold start lands: the landing carousel, the setup wizard, or
 * the app. Renders nothing while it decides, so no screen flashes first, which
 * is why this is its own route rather than an effect inside HomeScreen.
 */
export default function BootGateScreen({ navigation }) {
  useEffect(() => {
    let mounted = true;

    (async () => {
      let target = "Home";
      try {
        const [loggedIn, state] = await Promise.all([
          getData("isLoggedIn"),
          getOnboardingState(),
        ]);
        if (loggedIn !== "yes") {
          target = "Home";
        } else if (state.status === "completed" || state.status === "dismissed") {
          target = "MainApp";
        } else {
          target = "Onboarding";
        }
      } catch {
        target = "Home";
      }
      if (mounted) navigation.replace(target);
    })();

    return () => {
      mounted = false;
    };
  }, [navigation]);

  return <View className="flex-1 bg-background" />;
}
