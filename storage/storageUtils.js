import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, or, query, where } from "firebase/firestore";
import { db } from "../db/firebaseConfig";
export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log("Error storing data:", e);
  }
};

export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.log("Error getting data:", e);
  }
};

export const fillData = async (username) => {
  try {
    const queryToCheck = query(
      collection(db, "user"),
      or(where("username", "==", username))
    );

    const querySnapshot = await getDocs(queryToCheck);

    querySnapshot.forEach((doc) => {
      const firstname = doc.data().first_name;
      console.log("First name:", firstname);
      storeData("firstname", firstname);
      const postal_code = doc.data().zip_code;
      storeData("postalcode", postal_code);
    });
  } catch (e) {
    console.log("Error finding first name:", e);
  }
};
