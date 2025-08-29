import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "react-toastify";

/**
 * Modale per modificare i dati di un mezzo.
 * @param {Object} props
 * @param {boolean} props.show - Stato visibilità modale
 * @param {Function} props.onClose - Funzione per chiudere il modale
 * @param {Object|null} props.mezzo - Oggetto mezzo da modificare
 * @param {Function} props.onAggiorna - Callback dopo salvataggio
 */
function ModificaMezzoModal({ show, onClose, mezzo, onAggiorna }) {
  const [formData, setFormData] = useState({
    marca: "",
    modello: "",
    matricola: "",
    clienteId: ""
  });
  const [loading, setLoading] = useState(false);
  const marcaRef = useRef();

  useEffect(() => {
    if (mezzo) {
      setFormData({
        marca: mezzo.marca || "",
        modello: mezzo.modello || "",
        matricola: mezzo.matricola || "",
        clienteId: mezzo.clienteId || ""
      });
    }
  }, [mezzo]);

  useEffect(() => {
    if (show && marcaRef.current) {
      setTimeout(() => marcaRef.current.focus(), 200);
    }
  }, [show]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid = formData.marca && formData.modello && formData.matricola;

  const handleSave = async () => {
    if (!mezzo?.id || !isFormValid) {
      toast.warning("⚠️ Compila tutti i campi obbligatori.");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "MEZZI", mezzo.id), formData);
      toast.success("✅ Mezzo aggiornato con successo");
      if (onAggiorna) onAggiorna();
      onClose();
    } catch (error) {
      console.error("Errore aggiornamento mezzo:", error);
      toast.error("❌ Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>✏️ Modifica Mezzo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Marca *</Form.Label>
            <Form.Control
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              ref={marcaRef}
              required
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Modello *</Form.Label>
            <Form.Control
              name="modello"
              value={formData.modello}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Matricola *</Form.Label>
            <Form.Control
              name="matricola"
              value={formData.matricola}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Cliente ID</Form.Label>
            <Form.Control
              name="clienteId"
              value={formData.clienteId}
              onChange={handleChange}
            />
          </Form.Group>
          <small className="text-muted">* Campi obbligatori</small>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          ❌ Annulla
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading || !isFormValid}>
          {loading ? "Salvataggio..." : "💾 Salva"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModificaMezzoModal;