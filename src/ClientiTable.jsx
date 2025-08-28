import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import * as XLSX from "xlsx";

const ClientiTable = () => {
  const [clienti, setClienti] = useState([]);
  const [filtrati, setFiltrati] = useState([]);
  const [query, setQuery] = useState("");
  const [modificaCliente, setModificaCliente] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchClienti = async () => {
    try {
      const snapshot = await getDocs(collection(db, "CLIENTI"));
      const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClienti(dati);
      setFiltrati(dati);
    } catch (error) {
      console.error("Errore nel caricamento clienti:", error);
    }
  };

  useEffect(() => {
    fetchClienti();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    const risultati = clienti.filter(c =>
      Object.values(c).some(val =>
        String(val).toLowerCase().includes(q)
      )
    );
    setFiltrati(risultati);
  }, [query, clienti]);

  const eliminaCliente = async (id) => {
    try {
      await deleteDoc(doc(db, "CLIENTI", id));
      await fetchClienti();
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
    }
  };

  const apriModifica = (cliente) => {
    setModificaCliente(cliente);
    setShowModal(true);
  };

  const salvaModifica = async () => {
    try {
      const ref = doc(db, "CLIENTI", modificaCliente.id);
      const { id, ...dati } = modificaCliente;
      await updateDoc(ref, dati);
      await fetchClienti();
      setShowModal(false);
    } catch (error) {
      console.error("Errore nella modifica:", error);
    }
  };

  const esportaCSV = () => {
    const righe = filtrati.map(c =>
      `"${c.ragioneSociale || c.Cliente || c["Nome completo"] || ""}","${c.email || ""}","${c.telefono || ""}","${c.indirizzo || ""}"`
    );
    const header = `"Ragione Sociale","Email","Telefono","Indirizzo"`;
    const contenuto = [header, ...righe].join("\n");
    const blob = new Blob([contenuto], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "clienti.csv";
    link.click();
  };

  const esportaExcel = () => {
    const dati = filtrati.map(c => ({
      "Ragione Sociale": c.ragioneSociale || c.Cliente || c["Nome completo"] || "",
      Email: c.email || "",
      Telefono: c.telefono || "",
      Indirizzo: c.indirizzo || ""
    }));
    const ws = XLSX.utils.json_to_sheet(dati);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clienti");
    XLSX.writeFile(wb, "clienti.xlsx");
  };

  const stampaTabella = () => {
    window.print();
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-3">🏢 Elenco Clienti</h3>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="🔍 Cerca cliente..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <Button variant="success" onClick={esportaCSV}>📤 CSV</Button>
        <Button variant="info" onClick={esportaExcel}>📊 Excel</Button>
        <Button variant="secondary" onClick={stampaTabella}>🖨️ Stampa</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Ragione Sociale</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Indirizzo</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((c) => (
              <tr key={c.id}>
                <td>{c.ragioneSociale || c.Cliente || c["Nome completo"] || "—"}</td>
                <td>{c.email || "—"}</td>
                <td>{c.telefono || "—"}</td>
                <td>{c.indirizzo || "—"}</td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => apriModifica(c)}>✏️</Button>{' '}
                  <Button variant="outline-danger" size="sm" onClick={() => eliminaCliente(c.id)}>🗑️</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                Nessun cliente trovato.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifica Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Ragione Sociale</Form.Label>
              <Form.Control
                value={modificaCliente?.ragioneSociale || ""}
                onChange={(e) => setModificaCliente({ ...modificaCliente, ragioneSociale: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={modificaCliente?.email || ""}
                onChange={(e) => setModificaCliente({ ...modificaCliente, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Telefono</Form.Label>
              <Form.Control
                value={modificaCliente?.telefono || ""}
                onChange={(e) => setModificaCliente({ ...modificaCliente, telefono: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Indirizzo</Form.Label>
              <Form.Control
                value={modificaCliente?.indirizzo || ""}
                onChange={(e) => setModificaCliente({ ...modificaCliente, indirizzo: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annulla</Button>
          <Button variant="primary" onClick={salvaModifica}>Salva</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClientiTable;