// 🔥 Inizializzazione Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
export const storage = getStorage(app);

// ✅ Configurazione del progetto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC6k_leG6tFdsOsUdg_iOVdQ21_uTE4CQM",
  authDomain: "manper-e1973.firebaseapp.com",
  projectId: "manper-e1973",
  storageBucket: "manper-e1973.appspot.com", // 🔧 corretto dominio per Storage
  messagingSenderId: "858629526676",
  appId: "1:858629526676:web:e9a71249bb806614d05081",
  measurementId: "G-YF22QCMGR3"
};

// 🚀 Inizializza l'app Firebase
const app = initializeApp(firebaseConfig);

// 📦 Esporta i servizi principali
export const db = getFirestore(app);       // Firestore Database
export const auth = getAuth(app);          // Autenticazione
export const storage = getStorage(app);    // Storage per file e documenti
export default app;                        // Istanza principale (opzionale)