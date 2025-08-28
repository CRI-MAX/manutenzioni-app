import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import ImportaExcel from "./ImportaExcel"; // ⬅️ Importa il componente di importazione

const Mezzi = () => {
  const [mezzi, setMezzi] = useState([]);
  const [modello, setModello] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [mezziSnap, clientiSnap] = await Promise.all([
        getDocs(collection(db, "mezzi")),
        getDocs(collection(db, "clienti")),
      ]);
      setMezzi(mezziSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setClienti(clientiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modello.trim() || !clienteId) {
      alert("Compila tutti i campi obbligatori.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "mezzi"), {
        modello: modello.trim(),
        clienteId,
      });
      setModello("");
      setClienteId("");
      fetchData();
    } catch (error) {
      console.error("Errore nel salvataggio del mezzo:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClienteNome = (id) =>
    clienti.find(c => c.id === id)?.ragioneSociale || "—";

  return (
    <Container className="mt-4">
      <h2 className="mb-4">🚜 Gestione Mezzi</h2>

      <ImportaExcel tipo="mezzi" /> {/* ⬅️ Sezione importazione da Excel */}

      <Form onSubmit={handleSubmit} className="mb-4 p-3 border rounded bg-light">
        <h5 className="mb-3">➕ Aggiungi nuovo mezzo</h5>

        <Form.Group className="mb-2">
          <Form.Label>Modello</Form.Label>
          <Form.Control
            value={modello}
            onChange={(e) => setModello(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cliente associato</Form.Label>
          <Form.Select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          >
            <option value="">Seleziona cliente</option>
            {clienti.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ragioneSociale}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Salvataggio in corso..." : "Salva mezzo"}
        </Button>
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Modello</th>
            <th>Cliente</th>
          </tr>
        </thead>
        <tbody>
          {mezzi.length > 0 ? (
            mezzi.map((m) => (
              <tr key={m.id}>
                <td>{m.modello || "—"}</td>
                <td>{getClienteNome(m.clienteId)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center text-muted">
                Nessun mezzo registrato.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Mezzi;