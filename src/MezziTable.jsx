import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import * as XLSX from "xlsx";

const MezziTable = () => {
  const [mezzi, setMezzi] = useState([]);
  const [filtrati, setFiltrati] = useState([]);
  const [query, setQuery] = useState("");
  const [modificaMezzo, setModificaMezzo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchMezzi = async () => {
      try {
        const snapshot = await getDocs(collection(db, "MEZZI"));
        const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMezzi(dati);
        setFiltrati(dati);
        console.log("Mezzi caricati:", dati);
      } catch (error) {
        console.error("Errore nel caricamento mezzi:", error);
      }
    };

    fetchMezzi();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    const risultati = mezzi.filter(m =>
      Object.values(m).some(val =>
        String(val).toLowerCase().includes(q)
      )
    );
    setFiltrati(risultati);
  }, [query, mezzi]);

  const eliminaMezzo = async (id) => {
    try {
      await deleteDoc(doc(db, "MEZZI", id));
      setMezzi(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
    }
  };

  const apriModifica = (mezzo) => {
    setModificaMezzo(mezzo);
    setShowModal(true);
  };

  const salvaModifica = async () => {
    try {
      const ref = doc(db, "MEZZI", modificaMezzo.id);
      const { id, ...dati } = modificaMezzo;
      await updateDoc(ref, dati);
      setMezzi(prev =>
        prev.map(m => (m.id === id ? modificaMezzo : m))
      );
      setShowModal(false);
    } catch (error) {
      console.error("Errore nella modifica:", error);
    }
  };

  const esportaCSV = () => {
    const righe = filtrati.map(m =>
      `"${m.targa}","${m.modello}","${m.marca}","${m.anno}"`
    );
    const header = `"Targa","Modello","Marca","Anno"`;
    const contenuto = [header, ...righe].join("\n");
    const blob = new Blob([contenuto], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mezzi.csv";
    link.click();
  };

  const esportaExcel = () => {
    const dati = filtrati.map(m => ({
      Targa: m.targa || "",
      Modello: m.modello || "",
      Marca: m.marca || "",
      Anno: m.anno || ""
    }));
    const ws = XLSX.utils.json_to_sheet(dati);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mezzi");
    XLSX.writeFile(wb, "mezzi.xlsx");
  };

  const stampaTabella = () => {
    window.print();
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-3">🚚 Elenco Mezzi</h3>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="🔍 Cerca mezzo..."
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
            <th>Targa</th>
            <th>Modello</th>
            <th>Marca</th>
            <th>Anno</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((m) => (
              <tr key={m.id}>
                <td>{m.targa || "—"}</td>
                <td>{m.modello || "—"}</td>
                <td>{m.marca || "—"}</td>
                <td>{m.anno || "—"}</td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => apriModifica(m)}>✏️</Button>{' '}
                  <Button variant="outline-danger" size="sm" onClick={() => eliminaMezzo(m.id)}>🗑️</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                Nessun mezzo trovato.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifica Mezzo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Targa</Form.Label>
              <Form.Control
                value={modificaMezzo?.targa || ""}
                onChange={(e) => setModificaMezzo({ ...modificaMezzo, targa: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Modello</Form.Label>
              <Form.Control
                value={modificaMezzo?.modello || ""}
                onChange={(e) => setModificaMezzo({ ...modificaMezzo, modello: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Marca</Form.Label>
              <Form.Control
                value={modificaMezzo?.marca || ""}
                onChange={(e) => setModificaMezzo({ ...modificaMezzo, marca: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Anno</Form.Label>
              <Form.Control
                value={modificaMezzo?.anno || ""}
                onChange={(e) => setModificaMezzo({ ...modificaMezzo, anno: e.target.value })}
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

export default MezziTable;