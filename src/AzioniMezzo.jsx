import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import GestioneAllegatiModal from "./GestioneAllegatiModal";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "react-toastify";

/**
 * Azioni disponibili per un mezzo: modifica, allegati, eliminazione.
 * @param {Object} props
 * @param {Object} props.mezzo - Oggetto mezzo con almeno { id }
 * @param {Function} props.onModifica - Callback per aprire la modifica
 * @param {Function} props.onAggiorna - Callback dopo eliminazione
 */
function AzioniMezzo({ mezzo, onModifica, onAggiorna }) {
  const [showAllegati, setShowAllegati] = useState(false);

  const handleElimina = async () => {
    if (!mezzo?.id) return;
    if (!window.confirm("Vuoi eliminare questo mezzo?")) return;

    try {
      await deleteDoc(doc(db, "MEZZI", mezzo.id));
      toast.success("🗑️ Mezzo eliminato");
      if (onAggiorna) onAggiorna();
    } catch (error) {
      console.error("Errore eliminazione mezzo:", error);
      toast.error("❌ Errore durante l'eliminazione");
    }
  };

  return (
    <>
      <div className="d-flex gap-2">
        <OverlayTrigger placement="top" overlay={<Tooltip>Modifica</Tooltip>}>
          <Button variant="outline-primary" size="sm" onClick={() => onModifica(mezzo)}>
            ✏️
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>Allegati</Tooltip>}>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowAllegati(true)}>
            📎
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>Elimina</Tooltip>}>
          <Button variant="outline-danger" size="sm" onClick={handleElimina}>
            🗑️
          </Button>
        </OverlayTrigger>
      </div>

      <GestioneAllegatiModal
        show={showAllegati}
        onClose={() => setShowAllegati(false)}
        mezzoId={mezzo.id}
      />
    </>
  );
}

export default AzioniMezzo;