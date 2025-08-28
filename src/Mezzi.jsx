import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import ImportaExcel from "./ImportaExcel";
import * as XLSX from "xlsx";

const Mezzi = () => {
  const [mezzi, setMezzi] = useState([]);
  const [filtrati, setFiltrati] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [modello, setModello] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [mezziSnap, clientiSnap] = await Promise.all([
        getDocs(collection(db, "MEZZI")),
        getDocs(collection(db, "CLIENTI")),
      ]);
      const mezziData = mezziSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const clientiData = clientiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMezzi(mezziData);
      setFiltrati(mezziData);
      setClienti(clientiData);
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modello.trim() || !clienteId) {
      alert("Compila tutti i campi obbligatori.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "MEZZI"), {
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

  const esportaCSV = () => {
    const righe = filtrati.map(m =>
      `"${m.modello || ""}","${getClienteNome(m.clienteId)}"`
    );
    const header = `"Modello","Cliente"`;
    const contenuto = [header, ...righe].join("\n");
    const blob = new Blob([contenuto], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mezzi.csv";
    link.click();
  };

  const esportaExcel = () => {
    const dati = filtrati.map(m => ({
      Modello: m.modello || "",
      Cliente: getClienteNome(m.clienteId)
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
      <h2 className="mb-4">🚜 Gestione Mezzi</h2>

      <ImportaExcel tipo="mezzi" />

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
            <th>Modello</th>
            <th>Cliente</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((m) => (
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