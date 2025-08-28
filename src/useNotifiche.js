import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Hook personalizzato per recuperare le notifiche da Firestore.
 * @param {Object} options - Filtri opzionali.
 * @param {string|null} options.utenteEmail - Email dell'utente da filtrare.
 * @param {string|null} options.tipo - Tipo di notifica da filtrare.
 */
export const useNotifiche = ({ utenteEmail = null, tipo = null } = {}) => {
  const [notifiche, setNotifiche] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  useEffect(() => {
    const fetchNotifiche = async () => {
      setCaricamento(true);
      setErrore(null);

      try {
        // Costruzione dinamica della query
        let q = query(collection(db, "NOTIFICHE"), orderBy("timestamp", "desc"));

        const filtri = [];
        if (utenteEmail) filtri.push(where("utente", "==", utenteEmail));
        if (tipo) filtri.push(where("tipo", "==", tipo));

        if (filtri.length > 0) {
          q = query(collection(db, "NOTIFICHE"), ...filtri, orderBy("timestamp", "desc"));
        }

        const snapshot = await getDocs(q);
        const dati = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || null
          };
        });

        setNotifiche(dati);
      } catch (err) {
        console.error("Errore nel recupero notifiche:", err);
        setErrore(err);
      } finally {
        setCaricamento(false);
      }
    };

    fetchNotifiche();
  }, [utenteEmail, tipo]);

  return { notifiche, caricamento, errore };
};