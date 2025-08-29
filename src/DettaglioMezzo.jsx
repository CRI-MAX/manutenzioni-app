import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import UploadFotoMezzo from "./UploadFotoMezzo";
import AllegatiIntervento from "./AllegatiIntervento";
import VisualizzaAllegati from "./VisualizzaAllegati";
import DateDisplay from "./components/DateDisplay";
import BadgeStato from "./components/BadgeStato";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const DettaglioMezzo = () => {
  const { mezzoId } = useParams();
  const [mezzo, setMezzo] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [interventi, setInterventi] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mezziSnap, clientiSnap, interventiSnap] = await Promise.all([
          getDocs(collection(db, "MEZZI")),
          getDocs(collection(db, "CLIENTI")),
          getDocs(collection(db, "INTERVENTI"))
        ]);

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

  if (!mezzo) return <p className="text-muted p-3">🔄 Caricamento dettagli mezzo...</p>;

  const intestazioniCSV = [
    { label: "Data", key: "data" },
    { label: "Tipo", key: "tipo" },
    { label: "Tecnico", key: "tecnico" },
    { label: "Note", key: "note" },
    { label: "Stato", key: "stato" },
    { label: "Prossima Scadenza", key: "prossimaScadenza" }
  ];

  const interventiExport = interventi.map((i) => ({
    data: i.data?.toDate?.().toISOString?.() || "—",
    tipo: i.tipo || "—",
    tecnico: i.tecnico || "—",
    note: i.note || "—",
    stato: i.stato || "—",
    prossimaScadenza: i.prossimaScadenza?.toDate?.().toISOString?.() || "—"
  }));

  const esportaExcel = () => {
    const ws = XLSX.utils.json_to_sheet(interventiExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Interventi");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `storico_interventi_${mezzoId}.xlsx`);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">🚚 Dettaglio Mezzo</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">📄 Informazioni Mezzo</h5>
          <p><strong>Modello:</strong> {mezzo.modello || "—"}</p>
          <p><strong>Cliente:</strong> {cliente?.ragioneSociale || "—"}</p>

          <UploadFotoMezzo mezzoId={mezzoId} />
          {mezzo.fotoUrl && (
            <img
              src={mezzo.fotoUrl}
              alt="Foto mezzo"
              className="img-fluid rounded mt-3 shadow-sm"
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">🛠️ Storico Interventi</h5>
        {interventi.length > 0 && (
          <div className="d-flex gap-2">
            <CSVLink
              data={interventiExport}
              headers={intestazioniCSV}
              filename={`storico_interventi_${mezzoId}.csv`}
              className="btn btn-outline-primary btn-sm"
            >
              📤 CSV
            </CSVLink>
            <Button variant="outline-success" size="sm" onClick={esportaExcel}>
              📊 Excel
            </Button>
          </div>
        )}
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Tecnico</th>
            <th>Note</th>
            <th>Stato</th>
            <th>Prossima Scadenza</th>
            <th>Allegati</th>
          </tr>
        </thead>
        <tbody>
          {interventi.length > 0 ? (
            interventi.map((int) => (
              <tr key={int.id}>
                <td><DateDisplay data={int.data} /></td>
                <td>{int.tipo || "—"}</td>
                <td>{int.tecnico || "—"}</td>
                <td>{int.note || "—"}</td>
                <td><BadgeStato stato={int.stato} /></td>
                <td><DateDisplay data={int.prossimaScadenza} /></td>
                <td>
                  <AllegatiIntervento interventoId={int.id} />
                  <VisualizzaAllegati allegati={int.allegati || []} />
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