import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";

const MezziTable = () => {
  const [mezzi, setMezzi] = useState([]);
  const [filtrati, setFiltrati] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchMezzi = async () => {
      try {
        const snapshot = await getDocs(collection(db, "MEZZI"));
        const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMezzi(dati);
        setFiltrati(dati);
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

  return (
    <Container className="mt-4">
      <h3 className="mb-3">🚚 Elenco Mezzi</h3>
      <Form.Control
        type="text"
        placeholder="🔍 Cerca mezzo..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Targa</th>
            <th>Modello</th>
            <th>Marca</th>
            <th>Anno</th>
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
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Nessun mezzo trovato.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default MezziTable;