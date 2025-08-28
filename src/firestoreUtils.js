import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";

const RACCOLTE = {
  CLIENTI: "CLIENTI",
  MEZZI: "MEZZI",
  UTENTI: "UTENTI",
  INTERVENTI: "INTERVENTI",
  NOTIFICHE: "NOTIFICHE"
};

/**
 * Restituisce il riferimento alla raccolta Firestore.
 * @param {string} nome - Nome logico della raccolta.
 * @returns {CollectionReference}
 */
export const getCollection = (nome) => {
  const chiave = nome.toUpperCase();
  const raccolta = RACCOLTE[chiave];
  if (!raccolta) {
    throw new Error(`❌ Raccolta Firestore non riconosciuta: "${nome}"`);
  }
  return collection(db, raccolta);
};

/**
 * Legge tutti i documenti da una raccolta.
 * @param {string} nome - Nome logico della raccolta.
 * @returns {Promise<Array<Object>>}
 */
export const leggiRaccolta = async (nome) => {
  try {
    const ref = getCollection(nome);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`❌ Errore nella lettura della raccolta "${nome}":`, error);
    throw error;
  }
};

/**
 * Scrive una lista di documenti in una raccolta.
 * @param {string} nome - Nome logico della raccolta.
 * @param {Array<Object>} dati - Array di oggetti da salvare.
 * @returns {Promise<Array<string>>} - Lista di ID dei documenti creati.
 */
export const scriviRaccolta = async (nome, dati) => {
  const ref = getCollection(nome);
  const risultati = [];
  for (const item of dati) {
    try {
      const docRef = await addDoc(ref, item);
      risultati.push(docRef.id);
    } catch (error) {
      console.error(`❌ Errore nel salvataggio in "${nome}":`, error);
    }
  }
  return risultati;
};