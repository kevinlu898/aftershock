import AsyncStorage from "@react-native-async-storage/async-storage";
const legacyAssistantPrefix = ["gui", "de"].join("");
const MIGRATIONS = [
  ["emergency_contacts", ["emergencyContacts"]],
  ["important_documents", ["importantDocuments"]],
  ["medical_info", ["medicalInfo", "medical"]],
  ["epicenter_ai_chats", [`${legacyAssistantPrefix}_chats`]],
  ["epicenter_ai_selected_chat", [`${legacyAssistantPrefix}_selected_chat`]],
  ["epicenter_ai_request_count", [`${legacyAssistantPrefix}_request_count`]],
];

export const migrateLegacyStorageKeys = async () => {
  for (const [canonicalKey, legacyKeys] of MIGRATIONS) {
    const canonicalValue = await AsyncStorage.getItem(canonicalKey);
    if (canonicalValue) continue;

    for (const legacyKey of legacyKeys) {
      const legacyValue = await AsyncStorage.getItem(legacyKey);
      if (!legacyValue) continue;
      await AsyncStorage.setItem(canonicalKey, legacyValue);
      break;
    }
  }
};
