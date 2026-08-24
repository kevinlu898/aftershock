import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { checkConnectivity } from "../lib/api";

export function useOnlineStatus({ pollMs = 0 } = {}) {
  const [isOnline, setIsOnline] = useState(true);
  const inFlight = useRef(false);

  const recheck = useCallback(async () => {
    if (inFlight.current) return undefined;
    inFlight.current = true;
    try {
      const online = await checkConnectivity();
      setIsOnline(online);
      return online;
    } finally {
      inFlight.current = false;
    }
  }, []);

  const reportFailure = useCallback(() => setIsOnline(false), []);
  const reportSuccess = useCallback(() => setIsOnline(true), []);

  useEffect(() => {
    let active = true;
    const run = () => {
      if (active) recheck();
    };

    run();

    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") run();
    });

    const timer = pollMs > 0 ? setInterval(run, pollMs) : null;

    return () => {
      active = false;
      subscription.remove();
      if (timer) clearInterval(timer);
    };
  }, [pollMs, recheck]);

  return { isOnline, recheck, reportFailure, reportSuccess };
}

export default useOnlineStatus;
