import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import "./NotifichePanel.css"; // opzionale per lo stile

function NotifichePanel() {
  const [notifiche, setNotifiche] = useState([]);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    const fetchNotifiche = async () => {
      try {
        const q = query(collection(db, "NOTIFICHE"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifiche(dati);
      } catch (error) {
        console.error("Errore nel recupero notifiche:", error);
      } finally {
        setCaricamento(false);
      }
    };
    fetchNotifiche();
  }, []);

  if (caricamento) return <p className="text-muted">🔄 Caricamento notifiche...</p>;

  if (notifiche.length === 0) return <p className="text-muted">📭 Nessuna notifica disponibile.</p>;

  return (
    <div className="notifiche-panel">
      <h4>🔔 Notifiche recenti</h4>
      <ul>
        {notifiche.map((n) => (
          <li key={n.id} className={`notifica ${n.tipo || "info"}`}>
            <span className="timestamp">{new Date(n.timestamp).toLocaleString()}</span>
            <strong>{n.utente || "Sistema"}:</strong> {n.messaggio}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotifichePanel;