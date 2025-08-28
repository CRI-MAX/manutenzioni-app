import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import * as XLSX from "xlsx";
import DateDisplay from "./components/DateDisplay";

const LogAttivita = () => {
  const [log, setLog] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [queryFiltro, setQueryFiltro] = useState("");

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const q = query(collection(db, "LOG"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const dati = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLog(dati);
      } catch (error) {
        console.error("Errore nel caricamento del log:", error);
      } finally {
        setCaricamento(false);
      }
    };

    fetchLog();
  }, []);

  const filtrati = log.filter(entry =>
    [entry.email, entry.azione]
      .filter(Boolean)
      .some(val => val.toLowerCase().includes(queryFiltro.toLowerCase()))
  );

  const renderAzioneBadge = (azione) => {
    const colori = {
      creazione: "success",
      modifica: "warning",
      eliminazione: "danger"
    };
    const chiave = azione?.toLowerCase();
    return <Badge bg={colori[chiave] || "secondary"}>{azione || "—"}</Badge>;
  };

  const esportaExcel = () => {
    const dati = filtrati.map(entry => ({
      Data: entry.timestamp?.toDate?.().toLocaleString() || "—",
      Utente: entry.email || "—",
      Azione: entry.azione || "—",
      Target: entry.target || "—"
    }));
    const ws = XLSX.utils.json_to_sheet(dati);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LogAttivita");
    XLSX.writeFile(wb, "log_attivita.xlsx");
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-4">📁 Registro Attività</h3>

      <div className="d-flex gap-3 mb-3 flex-wrap">
        <Form.Control
          type="text"
          placeholder="🔍 Cerca per email o azione..."
          value={queryFiltro}
          onChange={(e) => setQueryFiltro(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <Button variant="info" onClick={esportaExcel}>
          📤 Esporta Excel
        </Button>
      </div>

      {caricamento ? (
        <p className="text-muted">🔄 Caricamento in corso...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Data</th>
              <th>Utente</th>
              <th>Azione</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {filtrati.length > 0 ? (
              filtrati.map((entry) => (
                <tr key={entry.id}>
                  <td><DateDisplay data={entry.timestamp} /></td>
                  <td>{entry.email || "—"}</td>
                  <td>{renderAzioneBadge(entry.azione)}</td>
                  <td>{entry.target || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  Nessuna attività corrispondente alla ricerca.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default LogAttivita;