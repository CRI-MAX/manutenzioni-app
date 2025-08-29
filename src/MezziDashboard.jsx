import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import AzioniMezzo from "./AzioniMezzo";
import AllegatiBadge from "./AllegatiBadge";
import ModificaMezzoModal from "./ModificaMezzoModal";

function MezziDashboard() {
  const [mezzi, setMezzi] = useState([]);
  const [query, setQuery] = useState("");
  const [caricamento, setCaricamento] = useState(true);
  const [mezzoDaModificare, setMezzoDaModificare] = useState(null);

  const fetchMezzi = async () => {
    setCaricamento(true);
    try {
      const snapshot = await getDocs(collection(db, "MEZZI"));
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMezzi(lista);
    } catch (error) {
      console.error("Errore nel recupero mezzi:", error);
    } finally {
      setCaricamento(false);
    }
  };

  useEffect(() => {
    fetchMezzi();
  }, []);

  const filtrati = mezzi.filter(m =>
    [m.marca, m.modello, m.matricola, m.clienteId]
      .filter(Boolean)
      .some(val => val.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <Container className="mt-4">
      <h3 className="mb-3">🚚 Gestione Mezzi</h3>

      <Form.Control
        type="text"
        placeholder="🔍 Cerca per marca, modello, matricola..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
        style={{ maxWidth: "300px" }}
      />

      {caricamento ? (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Caricamento mezzi...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>Marca</th>
              <th>Modello</th>
              <th>Matricola</th>
              <th>Cliente ID</th>
              <th>Allegati</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtrati.length > 0 ? (
              filtrati.map((mezzo) => (
                <tr key={mezzo.id}>
                  <td>{mezzo.marca || "—"}</td>
                  <td>{mezzo.modello || "—"}</td>
                  <td>{mezzo.matricola || "—"}</td>
                  <td>{mezzo.clienteId || "—"}</td>
                  <td><AllegatiBadge allegati={mezzo.allegati} /></td>
                  <td>
                    <AzioniMezzo
                      mezzo={mezzo}
                      onModifica={(m) => setMezzoDaModificare(m)}
                      onAggiorna={fetchMezzi}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  Nessun mezzo corrispondente alla ricerca.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <ModificaMezzoModal
        show={!!mezzoDaModificare}
        onClose={() => setMezzoDaModificare(null)}
        mezzo={mezzoDaModificare}
        onAggiorna={fetchMezzi}
      />
    </Container>
  );
}

export default MezziDashboard;