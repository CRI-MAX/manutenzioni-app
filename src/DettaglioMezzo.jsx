import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";

const DettaglioMezzo = () => {
  const { mezzoId } = useParams();
  const [mezzo, setMezzo] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [interventi, setInterventi] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mezziSnap = await getDocs(collection(db, "MEZZI"));
        const clientiSnap = await getDocs(collection(db, "CLIENTI"));
        const interventiSnap = await getDocs(collection(db, "INTERVENTI"));

        const mezzi = mezziSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const clienti = clientiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const interventiAll = interventiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const trovatoMezzo = mezzi.find(m => m.id === mezzoId);
        setMezzo(trovatoMezzo);

        const trovatoCliente = clienti.find(c => c.id === trovatoMezzo?.clienteId);
        setCliente(trovatoCliente);

        const interventiMezzo = interventiAll.filter(i => i.mezzoId === mezzoId);
        setInterventi(interventiMezzo);
      } catch (error) {
        console.error("Errore nel caricamento dettagli mezzo:", error);
      }
    };

    fetchData();
  }, [mezzoId]);

  const formatData = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "—";
    return timestamp.toDate().toLocaleDateString("it-IT");
  };

  const getBadgeColor = (stato) => {
    switch (stato) {
      case "Effettuato": return "success";
      case "Programmato": return "warning";
      case "In Ritardo": return "danger";
      default: return "secondary";
    }
  };

  if (!mezzo) return <p className="text-muted p-3">🔄 Caricamento dettagli mezzo...</p>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">🚚 Dettaglio Mezzo</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">📄 Informazioni Mezzo</h5>
          <p><strong>Modello:</strong> {mezzo.modello || "—"}</p>
          <p><strong>Cliente:</strong> {cliente?.ragioneSociale || "—"}</p>
        </Card.Body>
      </Card>

      <h5 className="mb-3">🛠️ Storico Interventi</h5>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
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
          {interventi.length > 0 ? (
            interventi.map((int) => (
              <tr key={int.id}>
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
              <td colSpan="7" className="text-center text-muted">
                Nessun intervento registrato per questo mezzo.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default DettaglioMezzo;