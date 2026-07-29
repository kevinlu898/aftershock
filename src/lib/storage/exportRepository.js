import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseStoredValue } from "../../utils/storage";

const readFirst = async (keys) => {
  for (const key of keys) {
    const value = await AsyncStorage.getItem(key);
    if (value) return value;
  }
  return null;
};

export const buildExportPayload = async () => {
  const [plan, email, emergencyContacts, medicalInfo] = await Promise.all([
    AsyncStorage.getItem("my_plan"),
    AsyncStorage.getItem("email"),
    readFirst(["emergency_contacts", "emergencyContacts"]),
    readFirst(["medical_info", "medicalInfo", "medical"]),
  ]);

  return {
    ...(plan ? { plan: parseStoredValue(plan) } : {}),
    ...(email ? { email } : {}),
    ...(emergencyContacts
      ? { emergency_contact: parseStoredValue(emergencyContacts) }
      : {}),
    ...(medicalInfo
      ? { medical_info: parseStoredValue(medicalInfo) }
      : {}),
  };
};
