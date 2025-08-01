import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyB_HzRrVdysW3o-UXUdCkPqW9rH4fWWjyY",
  authDomain: "rankpilot-h3jpc.firebaseapp.com",
  projectId: "rankpilot-h3jpc",
  storageBucket: "rankpilot-h3jpc.firebasestorage.app",
  messagingSenderId: "283736429782",
  appId: "1:283736429782:web:a3e387a3a79a592121e577",
};

// Initialize Firebase using a singleton pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Functions and get a reference to the service
export const functions = getFunctions(app);
