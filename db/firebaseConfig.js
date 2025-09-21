// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwQqeq6Tqbhh755OT9p5uDtJaJbGAHeJQ",
  authDomain: "aftershock-project.firebaseapp.com",
  projectId: "aftershock-project",
  storageBucket: "aftershock-project.firebasestorage.app",
  messagingSenderId: "448990058326",
  appId: "1:448990058326:web:b544939d0b3a8e02e068f7",
  measurementId: "G-VXDS89KHN3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
