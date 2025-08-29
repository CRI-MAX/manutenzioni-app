import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import DateDisplay from "./components/DateDisplay";
import BadgeStato from "./components/BadgeStato";
import AllegatiIntervento from "./AllegatiIntervento";
import VisualizzaAllegati from "./VisualizzaAllegati";
import InterventiFiltratiReport from "./InterventiFiltratiReport";
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const InterventiFiltratiTable = ({
  cliente,
  tipo,
  tecnico,
  dataDa,
  dataA,
  allegatiPresenti
}) => {
  const [interventi, setInterventi] = useState([]);

  useEffect(() => {
    const fetchInterventi = async () => {
      try {
        const snapshot = await getDocs(collection(db, "INTERVENTI"));
        const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInterventi(dati);
      } catch (error) {
        console.error("Errore nel caricamento interventi:", error);
      }
    };
    fetchInterventi();
  }, []);

  const filtrati = interventi.filter((i) => {
    const matchCliente = cliente === "" || (i.cliente || "").toLowerCase().includes(cliente.toLowerCase());
    const matchTipo = tipo === "" || i.tipo === tipo;
    const matchTecnico = tecnico === "" || i.tecnico === tecnico;

    const dataIntervento = i.data?.toDate?.() || null;
    const matchDataDa = !dataDa || (dataIntervento && dataIntervento >= dataDa);
    const matchDataA = !dataA || (dataIntervento && dataIntervento <= dataA);

    const matchAllegati = !allegatiPresenti || (Array.isArray(i.allegati) && i.allegati.length > 0);

    return matchCliente && matchTipo && matchTecnico && matchDataDa && matchDataA && matchAllegati;
  });

  const handleStampa = () => {
    const htmlContent = ReactDOMServer.renderToStaticMarkup(
      <InterventiFiltratiReport interventi={filtrati} titolo="Report Interventi Filtrati" />
    );

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Report Interventi</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
          <style>
            body { padding: 2rem; font-family: 'Segoe UI', sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #dee2e6; padding: 0.5rem; text-align: left; }
            th { background-color: #f8f9fa; }
            img { max-height: 50px; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleExportPDF = () => {
    const htmlContent = ReactDOMServer.renderToStaticMarkup(
      <InterventiFiltratiReport interventi={filtrati} titolo="Report Interventi Filtrati" />
    );

    const opt = {
      margin: 10,
      filename: "report_interventi_filtrati.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().from(htmlContent).set(opt).save();
  };

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">📋 Interventi filtrati: {filtrati.length}</h5>
        {filtrati.length > 0 && (
          <div className="d-flex gap-2">
            <Button variant="outline-dark" size="sm" onClick={handleStampa}>
              🖨️ Stampa report
            </Button>
            <Button variant="outline-primary" size="sm" onClick={handleExportPDF}>
              📄 Esporta PDF
            </Button>
          </div>
        )}
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Tecnico</th>
            <th>Note</th>
            <th>Stato</th>
            <th>Allegati</th>
          </tr>
        </thead>
        <tbody>
          {filtrati.length > 0 ? (
            filtrati.map((i) => (
              <tr key={i.id}>
                <td><DateDisplay data={i.data} /></td>
                <td>{i.cliente || "—"}</td>
                <td>{i.tipo || "—"}</td>
                <td>{i.tecnico || "—"}</td>
                <td>{i.note || "—"}</td>
                <td><BadgeStato stato={i.stato} /></td>
                <td>
                  <AllegatiIntervento interventoId={i.id} />
                  <VisualizzaAllegati allegati={i.allegati || []} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                Nessun intervento corrispondente ai filtri selezionati.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default InterventiFiltratiTable;