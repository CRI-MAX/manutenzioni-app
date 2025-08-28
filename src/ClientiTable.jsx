import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";

const ClientiTable = () => {
  const [clienti, setClienti] = useState([]);
  const [filtrati, setFiltrati] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
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

  return (
    <Container className="mt-4">
      <h3 className="mb-3">🏢 Elenco Clienti</h3>
      <Form.Control
        type="text"
        placeholder="🔍 Cerca cliente..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Ragione Sociale</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Indirizzo</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((c) => (
              <tr key={c.id}>
                <td>{c.ragioneSociale || "—"}</td>
                <td>{c.email || "—"}</td>
                <td>{c.telefono || "—"}</td>
                <td>{c.indirizzo || "—"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Nessun cliente trovato.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default ClientiTable;