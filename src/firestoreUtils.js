import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";

const RACCOLTE = {
  CLIENTI: "CLIENTI",
  MEZZI: "MEZZI",
  UTENTI: "UTENTI",
  INTERVENTI: "INTERVENTI",
  NOTIFICHE: "NOTIFICHE"
};

export const getCollection = (nome) => {
  const chiave = nome.toUpperCase();
  if (!RACCOLTE[chiave]) {
    throw new Error(`❌ Raccolta Firestore non riconosciuta: "${nome}"`);
  }
  return collection(db, RACCOLTE[chiave]);
};

export const leggiRaccolta = async (nome) => {
  const ref = getCollection(nome);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const scriviRaccolta = async (nome, dati) => {
  const ref = getCollection(nome);
  const risultati = [];
  for (const item of dati) {
    const docRef = await addDoc(ref, item);
    risultati.push(docRef.id);
  }
  return risultati;
};