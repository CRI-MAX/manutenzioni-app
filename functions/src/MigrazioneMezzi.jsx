import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const migraMezzi = async () => {
  const snapshot = await getDocs(collection(db, "CLIENTI"));
  const mezziEstratti = snapshot.docs.filter((d) => {
    const dati = d.data();
    return dati.targa && dati.modello; // identifica i mezzi
  });

  for (const mezzoDoc of mezziEstratti) {
    const dati = mezzoDoc.data();

    // Salva nella raccolta MEZZI
    await addDoc(collection(db, "MEZZI"), {
      targa: dati.targa,
      modello: dati.modello,
      cliente: dati.cliente || dati.ragioneSociale || "—",
      stato: dati.stato || "Attivo"
    });

    // (Opzionale) Elimina dalla raccolta CLIENTI
    await deleteDoc(doc(db, "CLIENTI", mezzoDoc.id));
    console.log(`✅ Mezzo migrato: ${dati.targa}`);
  }

  alert("✅ Migrazione completata.");
};