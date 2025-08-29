import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import BadgeStato from "./components/BadgeStato";
import DateDisplay from "./components/DateDisplay";
import AllegatiIntervento from "./AllegatiIntervento";
import VisualizzaAllegati from "./VisualizzaAllegati";
import InterventiFiltratiReport from "./InterventiFiltratiReport";
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const InterventiFiltratiTableMobile = ({
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

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">📋 Interventi filtrati: {filtrati.length}</h5>
        {filtrati.length > 0 && (
          <div className="d-flex gap-2">
            <Button variant="outline-dark" size="sm" onClick={handleStampa}>
              🖨️ Stampa
            </Button>
            <Button variant="outline-primary" size="sm" onClick={handleExportPDF}>
              📄 PDF
            </Button>
          </div>
        )}
      </div>

      {filtrati.length > 0 ? (
        filtrati.map((i) => (
          <Card key={i.id} className="mb-3 shadow-sm">
            <Card.Body>
              <h6 className="mb-2">{i.tipo || "Intervento"} — <BadgeStato stato={i.stato} /></h6>
              <p className="mb-1"><strong>Data:</strong> <DateDisplay data={i.data} /></p>
              <p className="mb-1"><strong>Cliente:</strong> {i.cliente || "—"}</p>
              <p className="mb-1"><strong>Tecnico:</strong> {i.tecnico || "—"}</p>
              <p className="mb-1"><strong>Note:</strong> {i.note || "—"}</p>
              <div className="mt-2">
                <AllegatiIntervento interventoId={i.id} />
                <VisualizzaAllegati allegati={i.allegati || []} />
              </div>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p className="text-muted text-center">Nessun intervento corrispondente ai filtri selezionati.</p>
      )}
    </div>
  );
};

export default InterventiFiltratiTableMobile;