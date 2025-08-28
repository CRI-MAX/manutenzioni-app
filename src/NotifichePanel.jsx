import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import "./NotifichePanel.css";

function NotifichePanel() {
  const [notifiche, setNotifiche] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [filtroUtente, setFiltroUtente] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const fetchNotifiche = async () => {
    setCaricamento(true);
    try {
      let baseQuery = query(collection(db, "NOTIFICHE"), orderBy("timestamp", "desc"));
      const filtri = [];

      if (filtroUtente.trim()) filtri.push(where("utente", "==", filtroUtente.trim()));
      if (filtroTipo) filtri.push(where("tipo", "==", filtroTipo));

      const finalQuery = filtri.length > 0
        ? query(collection(db, "NOTIFICHE"), ...filtri, orderBy("timestamp", "desc"))
        : baseQuery;

      const snapshot = await getDocs(finalQuery);
      const dati = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || null,
      }));
      setNotifiche(dati);
    } catch (error) {
      console.error("Errore nel recupero notifiche:", error);
    } finally {
      setCaricamento(false);
    }
  };

  useEffect(() => {
    fetchNotifiche();
    const interval = setInterval(fetchNotifiche, 30000); // aggiornamento ogni 30s
    return () => clearInterval(interval);
  }, [filtroUtente, filtroTipo]);

  const eliminaNotifica = async (id) => {
    if (window.confirm("Vuoi eliminare questa notifica?")) {
      try {
        await deleteDoc(doc(db, "NOTIFICHE", id));
        fetchNotifiche();
      } catch (error) {
        console.error("Errore nell'eliminazione:", error);
      }
    }
  };

  const archiviaNotifica = (id) => {
    alert("🔒 Funzione di archiviazione simulata per la demo.");
  };

  if (caricamento) return <p className="text-muted">🔄 Caricamento notifiche...</p>;
  if (notifiche.length === 0) return <p className="text-muted">📭 Nessuna notifica disponibile.</p>;

  return (
    <div className="notifiche-panel">
      <h4 className="mb-3">🔔 Notifiche recenti</h4>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Filtra per utente..."
          value={filtroUtente}
          onChange={(e) => setFiltroUtente(e.target.value)}
          style={{ maxWidth: "200px" }}
        />
        <select
          className="form-select"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="">Tutti i tipi</option>
          <option value="info">ℹ️ Info</option>
          <option value="success">✅ Successo</option>
          <option value="warning">⚠️ Avviso</option>
          <option value="error">❌ Errore</option>
        </select>
      </div>

      <ul className="list-unstyled">
        {notifiche.map((n) => (
          <li key={n.id} className={`notifica ${n.tipo || "info"}`}>
            <div className="d-flex justify-content-between align-items-center">
              <span className="timestamp">
                {n.timestamp ? n.timestamp.toLocaleString("it-IT") : "—"}
              </span>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => eliminaNotifica(n.id)}
                  title="Elimina"
                >
                  🗑️
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => archiviaNotifica(n.id)}
                  title="Archivia"
                >
                  📥
                </button>
              </div>
            </div>
            <div className="mt-1">
              <strong>{n.utente || "Sistema"}:</strong> {n.messaggio}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotifichePanel;