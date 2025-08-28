import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Hook personalizzato per recuperare le notifiche da Firestore.
 * @param {Object} options - Filtri opzionali.
 * @param {string|null} options.utenteEmail - Email dell'utente da filtrare.
 * @param {string|null} options.tipo - Tipo di notifica da filtrare.
 * @param {number|null} options.limitCount - Numero massimo di notifiche da recuperare.
 * @param {number|null} options.autoRefresh - Intervallo di aggiornamento automatico in ms.
 */
export const useNotifiche = ({
  utenteEmail = null,
  tipo = null,
  limitCount = null,
  autoRefresh = null
} = {}) => {
  const [notifiche, setNotifiche] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  const buildQuery = useCallback(() => {
    const base = collection(db, "NOTIFICHE");
    const filtri = [];

    if (utenteEmail) filtri.push(where("utente", "==", utenteEmail));
    if (tipo) filtri.push(where("tipo", "==", tipo));
    if (limitCount) filtri.push(limit(limitCount));

    return query(base, ...filtri, orderBy("timestamp", "desc"));
  }, [utenteEmail, tipo, limitCount]);

  const fetchNotifiche = useCallback(async () => {
    setCaricamento(true);
    setErrore(null);

    try {
      const q = buildQuery();
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
  }, [buildQuery]);

  useEffect(() => {
    fetchNotifiche();
    if (autoRefresh) {
      const interval = setInterval(fetchNotifiche, autoRefresh);
      return () => clearInterval(interval);
    }
  }, [fetchNotifiche, autoRefresh]);

  return { notifiche, caricamento, errore, refresh: fetchNotifiche };
};