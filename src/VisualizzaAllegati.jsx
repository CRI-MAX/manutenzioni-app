import React from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import { toast } from "react-toastify";

/**
 * Visualizza e gestisce gli allegati associati a un'entità.
 * @param {Array} allegati - Array di oggetti { url, nome, tipo }
 * @param {string} mezzoId - ID del mezzo (necessario per aggiornare Firestore)
 * @param {Function} onAggiorna - Callback per aggiornare la vista dopo eliminazione
 */
function VisualizzaAllegati({ allegati = [], mezzoId, onAggiorna }) {
  const handleDelete = async (allegato) => {
    if (!window.confirm(`Vuoi eliminare l'allegato "${allegato.nome || "senza nome"}"?`)) return;

    try {
      const fileRef = ref(storage, allegato.url);
      await deleteObject(fileRef);

      const docRef = doc(db, "MEZZI", mezzoId);
      const nuoviAllegati = allegati.filter(a => a.url !== allegato.url);
      await updateDoc(docRef, { allegati: nuoviAllegati });

      toast.success("🗑️ Allegato eliminato");
      if (onAggiorna) onAggiorna();
    } catch (error) {
      console.error("Errore nell'eliminazione allegato:", error);
      toast.error("❌ Errore durante l'eliminazione");
    }
  };

  if (!Array.isArray(allegati) || allegati.length === 0) {
    return <p className="text-muted">📎 Nessun allegato disponibile</p>;
  }

  return (
    <div className="mt-2">
      {allegati.map((a, i) => (
        <div key={i} className="mb-3 d-flex align-items-start gap-3">
          {a.tipo === "foto" ? (
            <a href={a.url} target="_blank" rel="noopener noreferrer">
              <img
                src={a.url}
                alt={a.nome || `Allegato ${i + 1}`}
                className="img-thumbnail"
                style={{ maxWidth: "150px" }}
              />
            </a>
          ) : (
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-secondary btn-sm"
            >
              📄 {a.nome || `Documento ${i + 1}`}
            </a>
          )}
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(a)}
          >
            🗑️ Elimina
          </button>
        </div>
      ))}
    </div>
  );
}

export default VisualizzaAllegati;