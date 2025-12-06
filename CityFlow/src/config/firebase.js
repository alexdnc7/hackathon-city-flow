// src/config/firebase.js
import { initializeApp } from "firebase/app";
// Importăm inMemoryPersistence -> Asta face ca login-ul să se șteargă când închizi app
import { initializeAuth, getAuth, inMemoryPersistence } from "firebase/auth"; 

const firebaseConfig = {
  // PUNE DATELE TALE REALE AICI
  apiKey: "AIzaSyBzj7ZqMIp0d0Ggm2XoW1ClTah-9v1cRG0",
  authDomain: "cityflow-89c62.firebaseapp.com",
  projectId: "cityflow-89c62",
  storageBucket: "cityflow-89c62.firebasestorage.app",
  messagingSenderId: "476171573424",
  appId: "1:476171573424:web:720c0e01ca535ab4814375"
};

const app = initializeApp(firebaseConfig);

let auth;
try {
  // Încercăm să setăm persistența doar în memorie (RAM)
  auth = initializeAuth(app, {
    persistence: inMemoryPersistence
  });
} catch (e) {
  // Fallback
  auth = getAuth(app);
}

export { auth };