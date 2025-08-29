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
import * as XLSX from "xlsx";

// ✅ Importa i componenti modulari
import { SafeRow, ImportaFile } from "./components/CSVImporter";

const Clienti = () => {
  const [clienti, setClienti] = useState([]);
  const [filtrati, setFiltrati] = useState([]);
  const [query, setQuery] = useState("");
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [referente, setReferente] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClienti = async () => {
    try {
      const snapshot = await getDocs(collection(db, "CLIENTI"));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClienti(lista);
      setFiltrati(lista);
    } catch (error) {
      console.error("Errore nel caricamento clienti:", error);
    }
  };

  useEffect(() => {
    fetchClienti();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    const risultati = clienti.filter((c) =>
      Object.values(c).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    );
    setFiltrati(risultati);
  }, [query, clienti]);

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
        await updateDoc(doc(db, "CLIENTI", editingId), clienteData);
      } else {
        await addDoc(collection(db, "CLIENTI"), clienteData);
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
    setRagioneSociale(cliente.ragioneSociale || "");
    setPartitaIva(cliente.partitaIva || "");
    setReferente(cliente.referente || "");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questo cliente?")) {
      try {
        await deleteDoc(doc(db, "CLIENTI", id));
        fetchClienti();
      } catch (error) {
        console.error("Errore nell'eliminazione:", error);
      }
    }
  };

  const salvaImportati = async (dati) => {
    try {
      for (const item of dati) {
        await addDoc(collection(db, "CLIENTI"), item);
      }
      fetchClienti();
    } catch (error) {
      console.error("Errore importazione:", error);
    }
  };

  const esportaCSV = () => {
    const righe = filtrati.map((c) =>
      `"${c.ragioneSociale || ""}","${c.partitaIva || ""}","${c.referente || ""}"`
    );
    const header = `"Ragione Sociale","Partita IVA","Referente"`;
    const contenuto = [header, ...righe].join("\n");
    const blob = new Blob([contenuto], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "clienti.csv";
    link.click();
  };

  const esportaExcel = () => {
    const dati = filtrati.map((c) => ({
      "Ragione Sociale": c.ragioneSociale || "",
      "Partita IVA": c.partitaIva || "",
      Referente: c.referente || "",
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
      <h2 className="mb-4">📁 Gestione Clienti</h2>

      <ImportaFile
        titolo="📥 Importa Clienti (.csv o .xlsx)"
        onUpload={salvaImportati}
      />

      <Form onSubmit={handleSubmit} className="mb-4 p-3 border rounded bg-light">
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
            <th>Partita IVA</th>
            <th>Referente</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((c) => (
              <tr key={c.id}>
                <SafeRow row={c} />
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(c)}
                  >
                    ✏️
                  </Button>{" "}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(c.id)}
                  >
                    🗑️
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