import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import GestioneAllegati from "./GestioneAllegati";

/**
 * Modale per gestire gli allegati di un mezzo.
 * @param {Object} props
 * @param {boolean} props.show - Stato visibilità modale
 * @param {Function} props.onClose - Funzione per chiudere il modale
 * @param {string} props.mezzoId - ID del mezzo da gestire
 */
function GestioneAllegatiModal({ show, onClose, mezzoId }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (show && mezzoId) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [show, mezzoId]);

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>📁 Allegati Mezzo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {ready ? (
          <GestioneAllegati mezzoId={mezzoId} />
        ) : (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2">Caricamento in corso...</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          ❌ Chiudi
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GestioneAllegatiModal;