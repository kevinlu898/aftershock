import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addDoc,
  collection,
  getDocs,
  or,
  query,
  where,
} from "firebase/firestore";
import { db } from "../db/firebaseConfig";
import { aiResponse } from "../requests";

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

export const clearData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.log("Error clearing data:", e);
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
      // store email for quick local access
      const email = doc.data().email || null;
      if (email) storeData("email", email);
      const postal_code = doc.data().zip_code;
      storeData("postalcode", postal_code);
    });
  } catch (e) {
    console.log("Error finding first name:", e);
  }
};

export const getRisk = async (postal_code) => {
  try {
    const thing = await getData("riskdata");
    if (thing) {
      return thing;
    } else {
      const queryToCheck = query(
        collection(db, "postal_data"),
        or(where("postal_code", "==", postal_code))
      );

      const querySnapshot = await getDocs(queryToCheck);
      const risks = [];
      querySnapshot.forEach((doc) => {
        risks.push(doc.data().data);
      });
      if (risks.length === 0) {
        const dataNew = await aiResponse(
          `What is the general earthquake risk for postal code ${postal_code}? Tell me how it is in general (either high-risk or low-risk or somewhere in the middle)`
        );
        console.log(dataNew);
        addDoc(collection(db, "postal_data"), {
          postal_code: postal_code,
          data: dataNew,
        });
        risks.push(dataNew);
      }
      await storeData("riskdata", risks[0]);
      return risks[0];
    }
  } catch (e) {
    console.log("Error getting risk data:", e);
  }
};
