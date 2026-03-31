import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Config (REAL)
const firebaseConfig = {
  apiKey: "AIzaSyBzPt3XzMm5qNP2ueFY8SY3qmvcKVEojWk",
  authDomain: "hotel-management-system-94c39.firebaseapp.com",
  projectId: "hotel-management-system-94c39",
  storageBucket: "hotel-management-system-94c39.firebasestorage.app",
  messagingSenderId: "604957155788",
  appId: "1:604957155788:web:a854d88e7c98338e6b7d69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
