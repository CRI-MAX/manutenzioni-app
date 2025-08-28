import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";

const LogAttivita = () => {
  const [log, setLog] = useState([]);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const q = query(collection(db, "LOG"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLog(dati);
      } catch (error) {
        console.error("Errore nel caricamento del log:", error);
      } finally {
        setCaricamento(false);
      }
    };

    fetchLog();
  }, []);

  const formatData = (timestamp) => {
    if (!timestamp) return "—";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      return date.toLocaleString("it-IT");
    } catch {
      return "—";
    }
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-4">📁 Registro Attività</h3>
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
            {log.length > 0 ? (
              log.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatData(entry.timestamp)}</td>
                  <td>{entry.email || "—"}</td>
                  <td>{entry.azione || "—"}</td>
                  <td>{entry.target || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  Nessuna attività registrata.
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