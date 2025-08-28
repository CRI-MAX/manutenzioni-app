import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";

const DashboardInterventi = () => {
  const [interventi, setInterventi] = useState([]);
  const [mezzi, setMezzi] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [filtroStato, setFiltroStato] = useState("");
  const [filtroTesto, setFiltroTesto] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interventiSnap, mezziSnap, clientiSnap] = await Promise.all([
          getDocs(collection(db, "interventi")),
          getDocs(collection(db, "mezzi")),
          getDocs(collection(db, "clienti")),
        ]);

        setInterventi(interventiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setMezzi(mezziSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setClienti(clientiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Errore nel caricamento dati:", error);
      }
    };

    fetchData();
  }, []);

  const formatData = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "—";
    const date = timestamp.toDate();
    return date.toLocaleDateString("it-IT");
  };

  const getBadgeColor = (stato) => {
    switch (stato) {
      case "Effettuato": return "success";
      case "Programmato": return "warning";
      case "In Ritardo": return "danger";
      default: return "secondary";
    }
  };

  const getMezzoNome = (id) => mezzi.find(m => m.id === id)?.modello || "—";

  const getClienteNome = (mezzoId) => {
    const mezzo = mezzi.find(m => m.id === mezzoId);
    const cliente = clienti.find(c => c.id === mezzo?.clienteId);
    return cliente?.ragioneSociale || "—";
  };

  const interventiFiltrati = interventi.filter((int) =>
    (filtroStato === "" || int.stato === filtroStato) &&
    (
      getMezzoNome(int.mezzoId).toLowerCase().includes(filtroTesto.toLowerCase()) ||
      int.tecnico?.toLowerCase().includes(filtroTesto.toLowerCase())
    )
  );

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📋 Dashboard Interventi</h2>

      <Form className="d-flex gap-3 mb-3">
        <Form.Select value={filtroStato} onChange={(e) => setFiltroStato(e.target.value)}>
          <option value="">Tutti gli stati</option>
          <option value="Effettuato">Effettuato</option>
          <option value="Programmato">Programmato</option>
          <option value="In Ritardo">In Ritardo</option>
        </Form.Select>

        <Form.Control
          type="text"
          placeholder="Cerca mezzo o tecnico"
          value={filtroTesto}
          onChange={(e) => setFiltroTesto(e.target.value)}
        />
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Mezzo</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Tipo</th>
            <th>Tecnico</th>
            <th>Note</th>
            <th>Stato</th>
            <th>Prossima Scadenza</th>
            <th>Allegato</th>
          </tr>
        </thead>
        <tbody>
          {interventiFiltrati.length > 0 ? (
            interventiFiltrati.map((int) => (
              <tr key={int.id}>
                <td>{getMezzoNome(int.mezzoId)}</td>
                <td>{getClienteNome(int.mezzoId)}</td>
                <td>{formatData(int.data)}</td>
                <td>{int.tipo || "—"}</td>
                <td>{int.tecnico || "—"}</td>
                <td>{int.note || "—"}</td>
                <td>
                  <span className={`badge bg-${getBadgeColor(int.stato)}`}>
                    {int.stato || "—"}
                  </span>
                </td>
                <td>{formatData(int.prossimaScadenza)}</td>
                <td>
                  {int.allegato ? (
                    <a href={int.allegato} target="_blank" rel="noopener noreferrer">
                      📎 Visualizza
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center text-muted">
                Nessun intervento trovato.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default DashboardInterventi;