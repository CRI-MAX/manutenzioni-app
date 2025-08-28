import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import * as XLSX from "xlsx";

const InterventiTable = () => {
  const [interventi, setInterventi] = useState([]);
  const [filtrati, setFiltrati] = useState([]);
  const [query, setQuery] = useState("");
  const [filtroStato, setFiltroStato] = useState("");
  const [modifica, setModifica] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchInterventi = async () => {
      try {
        const snapshot = await getDocs(collection(db, "INTERVENTI"));
        const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInterventi(dati);
        setFiltrati(dati);
      } catch (error) {
        console.error("Errore nel caricamento interventi:", error);
      }
    };

    fetchInterventi();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    const risultati = interventi.filter(i =>
      Object.values(i).some(val =>
        String(val).toLowerCase().includes(q)
      ) && (filtroStato ? i.stato === filtroStato : true)
    );
    setFiltrati(risultati);
  }, [query, filtroStato, interventi]);

  const eliminaIntervento = async (id) => {
    if (window.confirm("Vuoi eliminare questo intervento?")) {
      await deleteDoc(doc(db, "INTERVENTI", id));
      setInterventi(prev => prev.filter(i => i.id !== id));
    }
  };

  const apriModifica = (i) => {
    setModifica(i);
    setShowModal(true);
  };

  const salvaModifica = async () => {
    try {
      const ref = doc(db, "INTERVENTI", modifica.id);
      const { id, ...dati } = modifica;
      await updateDoc(ref, dati);
      setInterventi(prev =>
        prev.map(i => (i.id === id ? modifica : i))
      );
      setShowModal(false);
    } catch (error) {
      console.error("Errore nella modifica:", error);
    }
  };

  const esportaCSV = () => {
    const righe = filtrati.map(i =>
      `"${i.mezzo}","${i.data}","${i.tecnico}","${i.stato}","${i.note}"`
    );
    const header = `"Mezzo","Data","Tecnico","Stato","Note"`;
    const contenuto = [header, ...righe].join("\n");
    const blob = new Blob([contenuto], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "interventi.csv";
    link.click();
  };

  const esportaExcel = () => {
    const dati = filtrati.map(i => ({
      Mezzo: i.mezzo || "",
      Data: i.data || "",
      Tecnico: i.tecnico || "",
      Stato: i.stato || "",
      Note: i.note || ""
    }));
    const ws = XLSX.utils.json_to_sheet(dati);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Interventi");
    XLSX.writeFile(wb, "interventi.xlsx");
  };

  const stampaTabella = () => {
    window.print();
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-3">🛠️ Elenco Interventi</h3>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="🔍 Cerca..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: "250px" }}
        />
        <Form.Select
          value={filtroStato}
          onChange={(e) => setFiltroStato(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="">Tutti gli stati</option>
          <option value="Effettuato">✅ Effettuato</option>
          <option value="Programmato">📅 Programmato</option>
          <option value="In Ritardo">⏰ In Ritardo</option>
        </Form.Select>
        <Button variant="success" onClick={esportaCSV}>📤 CSV</Button>
        <Button variant="info" onClick={esportaExcel}>📊 Excel</Button>
        <Button variant="secondary" onClick={stampaTabella}>🖨️ Stampa</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Mezzo</th>
            <th>Data</th>
            <th>Tecnico</th>
            <th>Stato</th>
            <th>Note</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((i) => (
              <tr key={i.id}>
                <td>{i.mezzo || "—"}</td>
                <td>{i.data || "—"}</td>
                <td>{i.tecnico || "—"}</td>
                <td>{i.stato || "—"}</td>
                <td>{i.note || "—"}</td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => apriModifica(i)}>✏️</Button>{' '}
                  <Button variant="outline-danger" size="sm" onClick={() => eliminaIntervento(i.id)}>🗑️</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                Nessun intervento trovato.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifica Intervento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Mezzo</Form.Label>
              <Form.Control
                value={modifica?.mezzo || ""}
                onChange={(e) => setModifica({ ...modifica, mezzo: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Data</Form.Label>
              <Form.Control
                type="date"
                value={modifica?.data || ""}
                onChange={(e) => setModifica({ ...modifica, data: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Tecnico</Form.Label>
              <Form.Control
                value={modifica?.tecnico || ""}
                onChange={(e) => setModifica({ ...modifica, tecnico: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Stato</Form.Label>
              <Form.Select
                value={modifica?.stato || ""}
                onChange={(e) => setModifica({ ...modifica, stato: e.target.value })}
              >
                <option value="">—</option>
                <option value="Effettuato">Effettuato</option>
                <option value="Programmato">Programmato</option>
                <option value="In Ritardo">In Ritardo</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={modifica?.note || ""}
                onChange={(e) => setModifica({ ...modifica, note: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annull