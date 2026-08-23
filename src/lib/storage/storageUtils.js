import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDoc, collection, getDocs, or, query, where, } from "firebase/firestore";
import { aiResponse } from "../api";
import { db } from "../firebaseConfig";
import { seedCompletionFromRemote } from "../onboardingState";

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

    // Awaited rather than fire-and-forget: LoginScreen routes through BootGate
    // as soon as this resolves, and the gate reads the values written here.
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.first_name) await storeData("firstname", data.first_name);
      if (data.email) await storeData("email", data.email);
      if (data.zip_code) await storeData("postalcode", String(data.zip_code));
      // Onboarding completion lives on the account, not the device, because
      // logout wipes local storage. Re-seed it here so returning users aren't
      // marched through setup again.
      if (data.onboarding_completed_at) {
        await seedCompletionFromRemote(data.onboarding_completed_at);
      }
    }
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
