// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDrFuCIZigSJDp1sxcup7cn9_as-42-DKc",
  authDomain: "bloodflow-b1964.firebaseapp.com",
  projectId: "bloodflow-b1964",
  storageBucket: "bloodflow-b1964.appspot.com",
  messagingSenderId: "955593138025",
  appId: "1:955593138025:web:7a68cdc498cc578dae27f8",
  measurementId: "G-9TKJYN54PW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app);
export { storage };