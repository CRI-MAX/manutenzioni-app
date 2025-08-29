import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import AllegatiUploader from "./AllegatiUploader";
import VisualizzaAllegati from "./VisualizzaAllegati";
import Spinner from "react-bootstrap/Spinner";

function GestioneAllegati({ mezzoId }) {
  const [allegati, setAllegati] = useState([]);
  const [caricamento, setCaricamento] = useState(true);

  const fetchAllegati = async () => {
    if (!mezzoId) return;
    setCaricamento(true);
    try {
      const docRef = doc(db, "MEZZI", mezzoId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const dati = snapshot.data();
        setAllegati(Array.isArray(dati.allegati) ? dati.allegati : []);
      } else {
        setAllegati([]);
      }
    } catch (error) {
      console.error("Errore nel recupero allegati:", error);
      setAllegati([]);
    } finally {
      setCaricamento(false);
    }
  };

  useEffect(() => {
    fetchAllegati();
  }, [mezzoId]);

  return (
    <div className="mt-4">
      <h4 className="mb-3">📁 Gestione Allegati Mezzo</h4>

      <AllegatiUploader mezzoId={mezzoId} onAggiorna={fetchAllegati} />

      <hr className="my-4" />

      <h5 className="mb-3">📎 Allegati esistenti</h5>
      {caricamento ? (
        <div className="text-center py-3">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Caricamento allegati...</p>
        </div>
      ) : allegati.length === 0 ? (
        <p className="text-muted">Nessun allegato disponibile per questo mezzo.</p>
      ) : (
        <VisualizzaAllegati
          allegati={allegati}
          mezzoId={mezzoId}
          onAggiorna={fetchAllegati}
        />
      )}
    </div>
  );
}

export default GestioneAllegati;