import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { fetchEarthquakeData } from "../lib/api";
import haptics from "../lib/haptics";
import { presentEarthquakeAlert } from "../lib/notifications";
import {
  getEarthquakeFingerprint,
  getLatestEarthquake,
  parseEarthquakeTime,
} from "../utils/earthquake";

const POLL_INTERVAL_MS = 10 * 60 * 1000;
const ALERT_TTL_MS = 20 * 60 * 1000;

export const ALERT_MIN_MAGNITUDE = 4;

const STORAGE_KEYS = {
  state: "emergencyState",
  time: "lastEarthquakeTime",
  fingerprint: "lastEarthquakeFingerprint",
  dismissed: "dismissedEarthquakeFingerprint",
  magnitude: "lastEarthquakeMagnitude",
  place: "lastEarthquakePlace",
};

const isExpired = (timestamp) =>
  timestamp !== null && Date.now() - timestamp > ALERT_TTL_MS;

export const useEarthquakeAlert = () => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [lastEarthquakeTime, setLastEarthquakeTime] = useState(null);
  const [magnitude, setMagnitude] = useState(null);
  const [place, setPlace] = useState(null);
  const dismissedRef = useRef(null);

  const clearAlert = useCallback(async () => {
    setIsEmergency(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.state, "no");
    } catch (error) {
      console.warn("Failed to clear earthquake alert state", error);
    }
  }, []);

  const dismiss = useCallback(async () => {
    setIsEmergency(false);
    try {
      const fingerprint = await AsyncStorage.getItem(STORAGE_KEYS.fingerprint);
      dismissedRef.current = fingerprint;
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.state, "no"],
        [STORAGE_KEYS.dismissed, fingerprint || ""],
      ]);
    } catch (error) {
      console.warn("Failed to persist earthquake alert dismissal", error);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const entries = await AsyncStorage.multiGet([
          STORAGE_KEYS.state,
          STORAGE_KEYS.time,
          STORAGE_KEYS.dismissed,
          STORAGE_KEYS.magnitude,
          STORAGE_KEYS.place,
        ]);
        if (!active) return;

        const stored = Object.fromEntries(entries);
        const state = stored[STORAGE_KEYS.state];
        const storedTime = stored[STORAGE_KEYS.time];
        dismissedRef.current = stored[STORAGE_KEYS.dismissed] || null;

        const storedMagnitude = Number(stored[STORAGE_KEYS.magnitude]);
        if (Number.isFinite(storedMagnitude)) setMagnitude(storedMagnitude);
        if (stored[STORAGE_KEYS.place]) setPlace(stored[STORAGE_KEYS.place]);
        if (storedTime) setLastEarthquakeTime(storedTime);

        if (isExpired(parseEarthquakeTime(storedTime))) {
          await clearAlert();
          return;
        }

        if (state === null) {
          await AsyncStorage.setItem(STORAGE_KEYS.state, "no");
        }
        setIsEmergency(state === "yes");
      } catch (error) {
        console.warn("Failed to initialize earthquake alert state", error);
      }
    };

    initialize();
    return () => {
      active = false;
    };
  }, [clearAlert]);

  useEffect(() => {
    let active = true;

    const checkForEarthquake = async () => {
      try {
        const rawPostalCode = await AsyncStorage.getItem("postalcode");
        const postalCode = Number(rawPostalCode) || undefined;
        const payload = await fetchEarthquakeData(postalCode);
        const latest = getLatestEarthquake(payload);
        const fingerprint = getEarthquakeFingerprint(latest);
        const eventTime = latest?.time || latest?.timeISO || null;
        const eventMagnitude = Number(latest?.mag);
        const eventPlace = latest?.place || null;

        if (!active) return;

        if (eventTime) {
          const storedTime = String(eventTime);
          await AsyncStorage.setItem(STORAGE_KEYS.time, storedTime);
          if (active) setLastEarthquakeTime(storedTime);
        }
        if (Number.isFinite(eventMagnitude)) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.magnitude,
            String(eventMagnitude)
          );
          if (active) setMagnitude(eventMagnitude);
        }
        if (eventPlace) {
          await AsyncStorage.setItem(STORAGE_KEYS.place, eventPlace);
          if (active) setPlace(eventPlace);
        }

        if (isExpired(parseEarthquakeTime(eventTime))) {
          await clearAlert();
          return;
        }

        if (!fingerprint) {
          await clearAlert();
          return;
        }

        const previousFingerprint = await AsyncStorage.getItem(
          STORAGE_KEYS.fingerprint
        );
        if (!active) return;

        if (fingerprint === previousFingerprint) return;

        await AsyncStorage.setItem(STORAGE_KEYS.fingerprint, fingerprint);

        if (dismissedRef.current === fingerprint) return;
        dismissedRef.current = null;

        const significant =
          !Number.isFinite(eventMagnitude) ||
          eventMagnitude >= ALERT_MIN_MAGNITUDE;

        if (!significant) {
          await clearAlert();
          return;
        }

        await AsyncStorage.setItem(STORAGE_KEYS.state, "yes");
        if (!active) return;
        setIsEmergency(true);
        haptics.warning();
        presentEarthquakeAlert({ magnitude: eventMagnitude, place: eventPlace });
      } catch (error) {
        console.warn("Earthquake polling failed", error);
      }
    };

    checkForEarthquake();
    const intervalId = setInterval(checkForEarthquake, POLL_INTERVAL_MS);

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") checkForEarthquake();
    });

    return () => {
      active = false;
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [clearAlert]);

  return { isEmergency, lastEarthquakeTime, magnitude, place, dismiss };
};
