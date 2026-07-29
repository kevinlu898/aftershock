import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { fetchEarthquakeData } from "../lib/api";
import {
  getEarthquakeFingerprint,
  getLatestEarthquake,
  parseEarthquakeTime,
} from "../utils/earthquake";

export const useEarthquakeAlert = () => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [lastEarthquakeTime, setLastEarthquakeTime] = useState(null);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const [state, storedTime] = await Promise.all([
          AsyncStorage.getItem("emergencyState"),
          AsyncStorage.getItem("lastEarthquakeTime"),
        ]);
        if (!active) return;

        const timestamp = parseEarthquakeTime(storedTime);
        const expired =
          timestamp !== null &&
          Date.now() - timestamp > 20 * 60 * 1000;

        if (storedTime) setLastEarthquakeTime(storedTime);
        if (expired) {
          await AsyncStorage.setItem("emergencyState", "no");
          setIsEmergency(false);
          return;
        }

        if (state === null) {
          await AsyncStorage.setItem("emergencyState", "no");
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
  }, []);

  useEffect(() => {
    let active = true;

    const checkForEarthquake = async () => {
      try {
        const rawPostalCode = await AsyncStorage.getItem(
          "postalcode"
        );
        const postalCode = Number(rawPostalCode) || undefined;
        const payload = await fetchEarthquakeData(postalCode);
        const latest = getLatestEarthquake(payload);
        const fingerprint = getEarthquakeFingerprint(latest);
        const eventTime = latest?.time || latest?.timeISO || null;

        if (eventTime) {
          const storedTime = String(eventTime);
          await AsyncStorage.setItem(
            "lastEarthquakeTime",
            storedTime
          );
          if (active) setLastEarthquakeTime(storedTime);
        }

        const previousFingerprint = await AsyncStorage.getItem(
          "lastEarthquakeFingerprint"
        );
        if (!active) return;

        if (fingerprint && fingerprint !== previousFingerprint) {
          await Promise.all([
            AsyncStorage.setItem(
              "lastEarthquakeFingerprint",
              fingerprint
            ),
            AsyncStorage.setItem("emergencyState", "yes"),
          ]);
          setIsEmergency(true);
        } else if (!fingerprint) {
          await AsyncStorage.setItem("emergencyState", "no");
          setIsEmergency(false);
        }
      } catch (error) {
        console.warn("Earthquake polling failed", error);
      }
    };

    checkForEarthquake();
    const intervalId = setInterval(
      checkForEarthquake,
      10 * 60 * 1000
    );

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return { isEmergency, lastEarthquakeTime };
};
