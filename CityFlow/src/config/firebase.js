// src/config/firebase.js
import { initializeApp } from "firebase/app";
// Importăm uneltele necesare pentru persistență pe mobil
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBzj7ZqMIp0d0Ggm2XoW1ClTah-9v1cRG0",
  authDomain: "cityflow-89c62.firebaseapp.com",
  projectId: "cityflow-89c62",
  storageBucket: "cityflow-89c62.firebasestorage.app",
  messagingSenderId: "476171573424",
  appId: "1:476171573424:web:720c0e01ca535ab4814375"
};

// Inițializăm aplicația
const app = initializeApp(firebaseConfig);

// 2. Inițializăm Auth cu persistență (ca să nu te delogheze când închizi app-ul)
let auth;
try {
  // Aceasta este metoda CORECTĂ pentru React Native/Expo
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  // Dacă auth e deja inițializat (se poate întâmpla la refresh rapid), îl luăm pe cel existent
  auth = getAuth(app);
}

export { auth };