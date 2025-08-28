import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "./firebase";

export const useNotifiche = ({ utenteEmail = null, tipo = null } = {}) => {
  const [notifiche, setNotifiche] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  useEffect(() => {
    const fetchNotifiche = async () => {
      setCaricamento(true);
      setErrore(null);

      try {
        let q = query(collection(db, "NOTIFICHE"), orderBy("timestamp", "desc"));

        if (utenteEmail) {
          q = query(q, where("utente", "==", utenteEmail));
        }

        if (tipo) {
          q = query(q, where("tipo", "==", tipo));
        }

        const snapshot = await getDocs(q);
        const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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