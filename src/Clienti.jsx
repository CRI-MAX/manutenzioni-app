import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import ImportaExcel from "./ImportaExcel"; // ⬅️ Importa il componente di importazione

const Clienti = () => {
  const [clienti, setClienti] = useState([]);
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [referente, setReferente] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClienti = async () => {
    const snapshot = await getDocs(collection(db, "clienti"));
    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClienti(lista);
  };

  useEffect(() => {
    fetchClienti();
  }, []);

  const resetForm = () => {
    setRagioneSociale("");
    setPartitaIva("");
    setReferente("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ragioneSociale.trim()) {
      alert("La ragione sociale è obbligatoria.");
      return;
    }

    setLoading(true);

    const clienteData = {
      ragioneSociale: ragioneSociale.trim(),
      partitaIva: partitaIva.trim(),
      referente: referente.trim(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "clienti", editingId), clienteData);
      } else {
        await addDoc(collection(db, "clienti"), clienteData);
      }
      resetForm();
      fetchClienti();
    } catch (err) {
      console.error("Errore salvataggio cliente:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setEditingId(cliente.id);
    setRagioneSociale(cliente.ragioneSociale);
    setPartitaIva(cliente.partitaIva || "");
    setReferente(cliente.referente || "");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questo cliente?")) {
      await deleteDoc(doc(db, "clienti", id));
      fetchClienti();
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📁 Gestione Clienti</h2>

      <ImportaExcel tipo="clienti" /> {/* ⬅️ Sezione importazione da Excel */}

      <Form
        onSubmit={handleSubmit}
        className="mb-4 p-3 border rounded bg-light"
      >
        <h5 className="mb-3">
          {editingId ? "✏️ Modifica cliente" : "➕ Aggiungi nuovo cliente"}
        </h5>

        <Form.Group className="mb-2">
          <Form.Label>Ragione Sociale</Form.Label>
          <Form.Control
            value={ragioneSociale}
            onChange={(e) => setRagioneSociale(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Partita IVA</Form.Label>
          <Form.Control
            value={partitaIva}
            onChange={(e) => setPartitaIva(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Referente</Form.Label>
          <Form.Control
            value={referente}
            onChange={(e) => setReferente(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {editingId ? "Salva modifiche" : "Salva cliente"}
        </Button>
        {editingId && (
          <Button
            variant="secondary"
            className="ms-2"
            onClick={resetForm}
            disabled={loading}
          >
            Annulla
          </Button>
        )}
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Ragione Sociale</th>
            <th>Partita IVA</th>
            <th>Referente</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {clienti.length > 0 ? (
            clienti.map((c) => (
              <tr key={c.id}>
                <td>{c.ragioneSociale}</td>
                <td>{c.partitaIva || "—"}</td>
                <td>{c.referente || "—"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(c)}
                  >
                    Modifica
                  </Button>{" "}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(c.id)}
                  >
                    Elimina
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Nessun cliente registrato.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Clienti;